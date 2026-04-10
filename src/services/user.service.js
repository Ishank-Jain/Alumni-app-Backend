const User = require('../models/user.model');

// GET all (filter + search)
const getUsers = async (filters) => {
  const query = {};

  if (filters.role) query.role = filters.role;
  if (filters.company) query.company = filters.company;
  if (filters.batch) query.batch = filters.batch;

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } }
    ];
  }

  return await User.find(query).select('-password');
};

// GET by ID
const getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

// UPDATE
const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};