const { User, LoginAttempt } = require('../../../models');

async function getUserByEmail(email) {
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.error('Failed to get user by email:', error.message);
    throw error;
  }
}

async function createLoginAttemptData(data) {
  try {
    await LoginAttempt.create(data);
    console.log('Login attempt data created:', data);
  } catch (error) {
    console.error('Failed to create login attempt data:', error.message);
    throw error;
  }
}

async function addLoginAttempt(email) {
  try {
    await LoginAttempt.create({ email });
    console.log('Login attempt added for email:', email);
  } catch (error) {
    console.error('Failed to add login attempt:', error.message);
    throw error;
  }
}

async function getLoginAttemptByEmail(email) {
  try {
    return await LoginAttempt.findOne({ email });
  } catch (error) {
    console.error('Failed to get login attempt:', error.message);
    throw error;
  }
}

async function updateLoginAttempt(email) {
  try {
    const attemptData = await getLoginAttemptByEmail(email);

    if (attemptData) {
      attemptData.attempts += 1;
      attemptData.lastAttempt = Date.now();
      await attemptData.save();
    } else {
      const newAttemptData = {
        email,
        attempts: 1,
        lastAttempt: Date.now()
      };
      await createLoginAttemptData(newAttemptData);
    }
  } catch (error) {
    console.error('Failed to update login attempt:', error.message);
    throw error;
  }
}

async function deleteLoginAttemptData(email) {
  try {
    await LoginAttempt.deleteOne({ email });
    console.log('Login attempt data deleted for email:', email);
  } catch (error) {
    console.error('Failed to delete login attempt data:', error.message);
    throw error;
  }
}

async function updateLoginAttemptData(attemptData) {
  try {
    await attemptData.save();
    console.log('Login attempt data updated:', attemptData);
  } catch (error) {
    console.error('Failed to update login attempt data:', error.message);
    throw error;
  }
}

async function getLoginAttemptByEmail(email) {
  try {
    return await LoginAttempt.findOne({ email });
  } catch (error) {
    console.error('Failed to get login attempt data:', error.message);
    throw error;
  }
}
async function resetLoginAttempts(email) {
  try {
    await LoginAttempt.deleteMany({ email });
    console.log('Login attempts reset for email:', email);
  } catch (error) {
    console.error('Failed to reset login attempts:', error.message);
    throw error;
  }
}

module.exports = {
  getUserByEmail,
  addLoginAttempt,
  getLoginAttemptByEmail,
  createLoginAttemptData,
  updateLoginAttempt,
  deleteLoginAttemptData,
  updateLoginAttemptData,
  resetLoginAttempts
};
