const authService = require('../services/auth.service');
const apiResponse = require('../utils/apiResponse');

// Register
const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);

    res.status(201).json(
      apiResponse('Account created', {
        user: result.user
      })
    );
  } catch (err) {
    next(err);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);

    res.status(200).json(
      apiResponse('Login successful', {
        user: result.user
      })
    );
  } catch (err) {
    next(err);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.user._id);

    res.status(200).json(
      apiResponse('Logged out successfully')
    );
  } catch (err) {
    next(err);
  }
};

// Refresh (optional if not using)
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    const result = await authService.refreshAccessToken(token);

    res.status(200).json(
      apiResponse('Token refreshed', result)
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, refreshToken };