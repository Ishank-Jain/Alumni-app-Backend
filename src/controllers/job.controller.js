const jobService = require('../services/job.service');

const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.getJobs(req.query);

    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    next(err);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);

    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

const createJob = async (req, res, next) => {
  try {
    // Simply pass req.body directly to the service. 
    // We removed postedBy: req.user._id
    const job = await jobService.createJob(req.body);

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body);

    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    await jobService.deleteJob(req.params.id);

    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};