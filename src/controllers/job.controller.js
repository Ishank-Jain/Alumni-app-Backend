// src/controllers/job.controller.js
const jobService = require("../services/job.service");

/**
 * GET /api/v1/jobs
 * Public / Logged-in depending route middleware
 */
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.getJobs(req.query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/jobs/:id
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);

    res.status(200).json({
      success: true,
      data: job
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/jobs
 * Protected: verifyToken + syncMongoUser + checkRole("admin","alumni")
 */
const createJob = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,

      /**
       * Main identity mapping (Use MongoDB ID if available, fallback to Keycloak sub)
       */
      createdBy: req.dbUser ? req.dbUser._id : req.user.sub,

      /**
       * JWT / DB data
       */
      createdByUsername: req.user.preferred_username || req.user.email,

      // NEW: Accurately grab the role from MongoDB instead of hardcoding "user"
      createdByRole: req.dbUser ? req.dbUser.role : (req.user.realm_access?.roles?.includes("admin") ? "admin" : "student")
    };

    const job = await jobService.createJob(payload);

    // --- NOTIFICATION LOGIC ---
    try {
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-api:3000';
      
      // We don't await this fetch so it doesn't block the API response
      fetch(`${notificationUrl}/api/v1/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: ['slack'], // Only trigger the Slack worker
          priority: 'normal',
          payload: {
            title: 'New Job Opportunity Posted! 💼',
            body: `*${job.title || 'Untitled Job'}*\n*Company:* ${job.company || 'N/A'}\n*Posted by:* ${payload.createdByUsername}`
          }
        })
      }).catch(err => console.error("Notification API unreachable:", err.message));
      
      console.log("Job creation event published to Slack");
    } catch (error) {
      console.error("Failed to publish job notification:", error.message);
    }
    // ------------------------------

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job
    });

  } catch (error) {
    next(error);
  }
};


/**
 * PUT /api/v1/jobs/:id
 */
const updateJob = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job
    });

  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/jobs/:id
 */
const deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJob(req.params.id);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};