const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");
const syncMongoUser = require("../../middlewares/syncMongoUser");
const adminController = require("../../controllers/admin.controller");

router.get("/health", verifyToken, checkRole("admin"), adminController.health);

router.get("/me", verifyToken, checkRole("admin"), adminController.me);

router.get(
  "/users/pending",
  verifyToken,
  syncMongoUser,
  checkRole("admin"),
  adminController.getPendingUsers,
);

router.get(
  "/users/all",
  verifyToken,
  syncMongoUser,
  checkRole("admin"),
  adminController.getAllUsers,
);

router.patch(
  "/users/:id/approve",
  verifyToken,
  syncMongoUser,
  checkRole("admin"),
  adminController.approveUser,
);

router.patch(
  "/users/:id/reject",
  verifyToken,
  syncMongoUser,
  checkRole("admin"),
  adminController.rejectUser,
);

module.exports = router;
