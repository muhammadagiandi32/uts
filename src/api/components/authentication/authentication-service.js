const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

// Batasan maksimum percobaan login yang gagal
const MAX_LOGIN_ATTEMPTS = 5;
// Jangka waktu dalam milidetik untuk reset batasan percobaan login yang gagal
const LOGIN_ATTEMPTS_RESET_TIME = 30 * 60 * 1000; // 1 menit dalam milidetik

async function checkLogin(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  if (user && passwordChecked) {
    await authenticationRepository.resetLoginAttempts(email);

    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
      success: true
    };
  }

  return { success: false };
}

async function updateLoginAttempt(email, success) {
  try {
    const attemptData = await authenticationRepository.getLoginAttemptByEmail(email);

    if (attemptData) {
      // Update existing login attempt record
      if (success) {
        // If login is successful, delete the login attempt record
        await authenticationRepository.deleteLoginAttemptData(email);
      } else {
        // If login fails, update the login attempt record
        attemptData.attempts += 1;
        attemptData.lastAttempt = Date.now();
        await authenticationRepository.updateLoginAttemptData(attemptData);

        // Check if the login attempt limit has been reached
        if (attemptData.attempts >= MAX_LOGIN_ATTEMPTS) {
          throw new Error('Too many failed login attempts');
        }
      }
    } else {
      // Add new login attempt record
      await authenticationRepository.createLoginAttemptData({ email, attempts: 1, lastAttempt: Date.now() });
    }
  } catch (error) {
    console.error('Failed to update login attempt:', error.message);
    throw error;
  }
}

async function isLoginLimitReached(email) {
  const attemptData = await authenticationRepository.getLoginAttemptByEmail(email);

  if (!attemptData) {
    return false;
  }

  if (attemptData.attempts >= MAX_LOGIN_ATTEMPTS) {
    const timeSinceLastAttempt = Date.now() - attemptData.lastAttempt;
    if (timeSinceLastAttempt < LOGIN_ATTEMPTS_RESET_TIME) {
      return true;
    } else {
      // Reset login attempt record after a certain time limit has passed
      await authenticationRepository.deleteLoginAttemptData(email);
      return false;
    }
  }

  return false;
}
async function handleSuccessfulLogin(email) {
  await authenticationRepository.resetLoginAttempts(email);
}

module.exports = {
  checkLogin,
  updateLoginAttempt,
  isLoginLimitReached,
  handleSuccessfulLogin
};
