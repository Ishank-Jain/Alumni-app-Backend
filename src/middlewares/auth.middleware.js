const User = require("../models/User.model.js");

const protect = async (req, res, next) => {
  try {
    // 🔹 1. Get userId (frontend se bhejna padega)
    const userId = req.headers["user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID required",
      });
    }

    // 🔹 2. Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔹 3. Role check
    if (user.role === "student") {
      return res.status(403).json({
        success: false,
        message: "Access denied: students cannot perform this action",
      });
    }

    // 🔹 4. Allow alumni/admin
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { protect };



// IGNORE THIS DOWN — THIS IS A TEMPORARY PLACEHOLDER FOR AUTH MIDDLEWARE.

// const { verifyAccessToken } = require('../utils/jwt.utils')
// const ApiError = require('../utils/apiError')
// const User = require('../models/user.model')

// /**
//  * protect — verifies JWT and attaches req.user
//  *
//  * Add this to any route that requires login:
//  * router.get('/profile', protect, userController.getProfile)
//  *
//  * Token must be sent as: Authorization: Bearer <token>
//  */

// const protect = async (req, res, next) => {
//   try {
//     // 1. Extract token from Authorization header
//     const authHeader = req.headers.authorization
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       throw new ApiError(401, 'No token provided — please login')
//     }

//     const token = authHeader.split(' ')[1]

//     // 2. Verify and decode the token
//     const decoded = verifyAccessToken(token)  // throws if invalid/expired

//     // 3. Check user still exists (e.g. account not deleted since token issued)
//     const user = await User.findById(decoded.id).select('+isActive')
//     if (!user || !user.isActive) {
//       throw new ApiError(401, 'User no longer exists or has been deactivated')
//     }

//     // 4. Attach user to request — available in all downstream controllers
//     req.user = user

//     next()
//   } catch (error) {
//     next(error)
//   }
// }

// module.exports = { protect }
