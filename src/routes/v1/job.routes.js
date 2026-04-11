const express = require('express');
const router = express.Router();
const jobController = require('../../controllers/job.controller');
// Temporarily comment out the protect middleware
// const { protect } = require('../../middlewares/auth.middleware');

/**
 * Job Routes — /api/v1/jobs
 */

// Public
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Temporarily make these public for database testing
router.post('/', jobController.createJob);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router;