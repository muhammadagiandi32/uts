const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    const isLimitReached = await authenticationServices.isLoginLimitReached(email);
    if (isLimitReached) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too many failed login attempts. Please try again later.'
      );
    }

    const loginResult = await authenticationServices.checkLogin(email, password);

    if (!loginResult.success) {
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    return response.status(200).json(loginResult);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
