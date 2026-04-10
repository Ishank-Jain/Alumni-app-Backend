const Job = require('../models/Job.model');

// GET all
const getJobs = async (filters) => {
  const query = {};

  if (filters.company) query.company = filters.company;
  if (filters.location) query.location = filters.location;

  if (filters.search) {
    query.title = { $regex: filters.search, $options: 'i' };
  }

  return await Job.find(query);
};

// GET by ID
const getJobById = async (id) => {
  return await Job.findById(id);
};

// CREATE
const createJob = async (data) => {
  return await Job.create(data);
};

// UPDATE
const updateJob = async (id, data) => {
  return await Job.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
const deleteJob = async (id) => {
  return await Job.findByIdAndDelete(id);
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};