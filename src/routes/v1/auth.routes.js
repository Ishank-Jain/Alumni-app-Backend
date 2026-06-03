const express = require("express");
const router = express.Router();

const authController = require("../../controllers/auth.controller");

const verifyToken = require("../../middlewares/verifyToken");
const syncMongoUser = require("../../middlewares/syncMongoUser");

// Public
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);

// Protected Bootstrap Route
router.get(
  "/me",
  verifyToken,
  syncMongoUser,
  authController.me
);

// NEW: Complete Profile Route (Phase 2 State Machine)
router.post(
  "/complete-profile",
  verifyToken,
  syncMongoUser,
  authController.completeProfile
);

module.exports = router;