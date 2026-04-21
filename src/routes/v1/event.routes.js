const express = require("express");
const router = express.Router();

const eventController = require("../../controllers/event.controller");

const verifyToken = require("../../middlewares/verifyToken");

const syncMongoUser = require("../../middlewares/syncMongoUser");

const checkRole = require("../../middlewares/checkRole");

/**
 * Event Routes
 * /api/v1/events
 */

/* ---------------- PUBLIC ---------------- */

router.get("/", eventController.getAllEvents);

router.get("/:id", eventController.getEventById);

/* --------------- PROTECTED --------------- */

/**
 * Create Event
 * alumni / admin / mentor
 */
router.post(
  "/",
  verifyToken,
  syncMongoUser,
  checkRole("admin", "alumni", "mentor"),
  eventController.createEvent,
);

/**
 * Update Event
 * owner or admin checked in controller
 */
router.put(
  "/:id",
  verifyToken,
  syncMongoUser,
  checkRole("admin", "alumni", "mentor"),
  eventController.updateEvent,
);

/**
 * Delete Event
 * owner or admin checked in controller
 */
router.delete(
  "/:id",
  verifyToken,
  syncMongoUser,
  checkRole("admin", "alumni", "mentor"),
  eventController.deleteEvent,
);

/**
 * My Events
 */
// router.get(
//   "/me/list",
//   verifyToken,
//   syncMongoUser,
//   eventController.getMyEvents
// );

module.exports = router;
