const express = require("express");
const router = express.Router();

const jobController = require("../../controllers/job.controller");

const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

/**
 * Job Routes — /api/v1/jobs
 */

/* ---------- Public Routes ---------- */

// Anyone logged in can view jobs
router.get("/", verifyToken, jobController.getAllJobs);

// Anyone logged in can view single job
router.get("/:id", verifyToken, jobController.getJobById);

/* ---------- Admin Protected Routes ---------- */

// Only admin can create job
router.post("/", verifyToken, checkRole("admin"), jobController.createJob);

// Only admin can update job
router.put("/:id", verifyToken, checkRole("admin"), jobController.updateJob);

// Only admin can delete job
router.delete("/:id", verifyToken, checkRole("admin"), jobController.deleteJob);

module.exports = router;
