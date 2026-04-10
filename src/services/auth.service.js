const User = require('../models/user.model');
const ApiError = require('../utils/apiError');

// Register
const registerUser = async ({ name, email, password, role, batch, company }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already exists');

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    batch,
    company,
  });

  return { user: user.toPublicJSON() };
};

// Login
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) throw new ApiError(401, 'Invalid credentials');

  // ⚠️ password check skipped (as per your current setup)

  return { user: user.toPublicJSON() };
};

// Logout (simple)
const logoutUser = async (userId) => {
  return true;
};

module.exports = { registerUser, loginUser, logoutUser };