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

/* -------------- PROTECTED STATIC ROUTES (Must go BEFORE /:id) --------------- */

/**
 * My mentorship profile (Original Flow)
 */
router.get(
  "/me/profile",
  verifyToken,
  syncMongoUser,
  mentorshipController.getMyMentorship
);

/**
 * NEW: Get current user's mentor details and enrolled students (Dashboard Flow)
 */
router.get(
  "/me",
  verifyToken,
  syncMongoUser,
  checkRole("admin", "alumni"),
  mentorshipController.getMyMentorshipDetails
);

/**
 * NEW: Register as a mentor instantly via User Model
 */
router.post(
  "/register",
  verifyToken,
  syncMongoUser,
  checkRole("admin", "alumni"),
  mentorshipController.registerMentor
);


/* ---------------- PUBLIC DYNAMIC ROUTES ---------------- */

/**
 * Get all approved mentors
 */
router.get("/", mentorshipController.getAllMentorships);

/**
 * Get mentor by id (WARNING: Dynamic params must always go after static routes like /me)
 */
router.get("/:id", mentorshipController.getMentorshipById);


/* -------------- PROTECTED DYNAMIC ROUTES --------------- */

/**
 * Become mentor / create profile (Original Service Flow)
 */
router.post(
  "/",
  verifyToken,
  syncMongoUser,
  checkRole("student", "alumni", "admin"),
  mentorshipController.createMentorship
);

/**
 * Update own profile
 */
router.put(
  "/:id",
  verifyToken,
  syncMongoUser,
  checkRole("student", "alumni", "mentor", "admin"),
  mentorshipController.updateMentorship
);

/**
 * Delete own profile
 */
router.delete(
  "/:id",
  verifyToken,
  syncMongoUser,
  checkRole("student", "alumni", "mentor", "admin"),
  mentorshipController.deleteMentorship
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
  mentorshipController.updateMentorshipStatus
);

module.exports = router;