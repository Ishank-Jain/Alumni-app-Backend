// src/routes/v1/job.routes.js
const express = require("express");
const router = express.Router();

const jobController = require("../../controllers/job.controller");

const verifyToken = require("../../middlewares/verifyToken");
const syncMongoUser = require("../../middlewares/syncMongoUser"); // <-- NEW: Import this
const checkRole = require("../../middlewares/checkRole");

/**
 * Job Routes — /api/v1/jobs
 */

/* ---------- Public Routes ---------- */

// Anyone logged in can view jobs
router.get("/", verifyToken, syncMongoUser, jobController.getAllJobs);

// Anyone logged in can view single job
router.get("/:id", verifyToken, syncMongoUser, jobController.getJobById);

/* ---------- Protected Routes ---------- */

// Admins and Alumni can create jobs
router.post(
  "/", 
  verifyToken, 
  syncMongoUser, // <-- NEW: Must be before checkRole
  checkRole("admin", "alumni", "recruiter"), 
  jobController.createJob
);

// Only admin can update job (or you can add "alumni" here if they should edit their own jobs)
router.put(
  "/:id", 
  verifyToken, 
  syncMongoUser, 
  checkRole("admin"), 
  jobController.updateJob
);

// Only admin can delete job
router.delete(
  "/:id", 
  verifyToken, 
  syncMongoUser, 
  checkRole("admin"), 
  jobController.deleteJob
);

module.exports = router;