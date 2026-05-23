const User = require("../models/User.model.js");
// const apiResponse = require('../utils/apiResponse');

const health = async (req, res) => {
  res.json({
    success: true,
    message: "Admin API working",
  });
};

const getPendingUsers = async (req, res, next) => {
  try {
    const users = await User.find(
      { status: "pending" },
      {
        password: 0,
        refreshToken: 0,
      },
    ).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const approveUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: req.dbUser._id,
      },
      { new: true },
    );

    res.json({
      success: true,
      message: "User approved",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const rejectUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
      },
      { new: true },
    );

    res.json({
      success: true,
      message: "User rejected",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find(
      {},
      {
        password: 0,
        refreshToken: 0,
      },
    ).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
};

module.exports = {
  health,
  me,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
};
