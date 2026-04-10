const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/job.controller');
const { protect } = require('../../middlewares/auth.middleware');

/**
 * Job Routes — /api/v1/jobs
 */

// Public
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Protected
router.post('/', protect, jobController.createJob);
router.put('/:id', protect, jobController.updateJob);
router.delete('/:id', protect, jobController.deleteJob);

module.exports = router;