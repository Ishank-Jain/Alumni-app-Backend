const userService = require('../services/user.service');

// GET all users (filter supported)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.query);

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// GET single user
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// UPDATE
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// DELETE
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);

    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};