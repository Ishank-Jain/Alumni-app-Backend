const express = require('express');
const router = express.Router();
const mentorshipController = require('../../controllers/mentorship.controller');
const { protect } = require('../../middlewares/auth.middleware');

/**
 * Mentorship Routes — /api/v1/mentorships
 */

// Public
router.get('/', mentorshipController.getAllMentorships);
router.get('/:id', mentorshipController.getMentorshipById);
router.post('/', mentorshipController.createMentorship);

// Protected
// router.post('/', protect, mentorshipController.createMentorship);
// router.put('/:id', protect, mentorshipController.updateMentorship);
// router.delete('/:id', protect, mentorshipController.deleteMentorship);

module.exports = router;