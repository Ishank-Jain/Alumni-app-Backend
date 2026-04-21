const express = require("express");
const router = express.Router();

const mentorshipController = require("../../controllers/mentorship.controller");

const verifyToken = require("../../middlewares/verifyToken");

const syncMongoUser = require("../../middlewares/syncMongoUser");

const checkRole = require("../../middlewares/checkRole");

/**
 * Mentorship Routes
 * /api/v1/mentorship
 */

/* ---------------- PUBLIC ---------------- */

/**
 * Get all approved mentors
 */
router.get("/", mentorshipController.getAllMentorships);

/**
 * Get mentor by id
 */
router.get("/:id", mentorshipController.getMentorshipById);

/* -------------- PROTECTED --------------- */

/**
 * My mentorship profile
 */
router.get(
  "/me/profile",
  verifyToken,
  syncMongoUser,
  mentorshipController.getMyMentorship,
);

/**
 * Become mentor / create profile
 * student / alumni / admin
 */
router.post(
  "/",
  verifyToken,
  syncMongoUser,
  checkRole("student", "alumni", "admin"),
  mentorshipController.createMentorship,
);

/**
 * Update own profile
 */
router.put(
  "/:id",
  verifyToken,
  syncMongoUser,
  checkRole("student", "alumni", "mentor", "admin"),
  mentorshipController.updateMentorship,
);

/**
 * Delete own profile
 */
router.delete(
  "/:id",
  verifyToken,
  syncMongoUser,
  checkRole("student", "alumni", "mentor", "admin"),
  mentorshipController.deleteMentorship,
);

/**
 * Approve / Reject mentor
 * admin only
 */
router.patch(
  "/:id/status",
  verifyToken,
  syncMongoUser,
  checkRole("admin"),
  mentorshipController.updateMentorshipStatus,
);

module.exports = router;
