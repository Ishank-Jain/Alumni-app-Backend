const express = require('express');
const router = express.Router();
const eventController = require('../../controllers/event.controller');
const { protect } = require('../../middlewares/auth.middleware');

/**
 * Event Routes — /api/v1/events
 */

// Public
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected
router.post('/', protect, eventController.createEvent);
router.put('/:id', protect, eventController.updateEvent);
router.delete('/:id', protect, eventController.deleteEvent);

module.exports = router;