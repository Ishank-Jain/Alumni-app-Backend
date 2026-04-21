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
 * Protected:
 * verifyToken + checkRole("admin","alumni")
 */
const createJob = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,

      /**
       * Main identity mapping
       */
      createdBy: req.user.sub,

      /**
       * JWT token data
       */
      createdByUsername:
        req.user.preferred_username,

      createdByRole:
        req.user.realm_access?.roles?.includes("admin")
          ? "admin"
          : "user"
    };

    const job =
      await jobService.createJob(payload);

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
 * Only admin route middleware should handle access
 */
const updateJob = async (req, res, next) => {
  try {
    const job =
      await jobService.updateJob(
        req.params.id,
        req.body
      );

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