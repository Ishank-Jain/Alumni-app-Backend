const Job = require("../models/Job.model.js");

/**
 * GET ALL JOBS
 * Supports:
 * company
 * location
 * search
 * employmentType
 * isActive
 * page
 * limit
 */

const getJobs = async (filters) => {
  const query = {};

  if (filters.company) {
    query.company = {
      $regex: filters.company,
      $options: "i"
    };
  }

  if (filters.location) {
    query.location = {
      $regex: filters.location,
      $options: "i"
    };
  }

  if (filters.employmentType) {
    query.employmentType =
      filters.employmentType;
  }

  if (filters.isActive !== undefined) {
    query.isActive =
      filters.isActive === "true";
  }

  if (filters.search) {
    query.$or = [
      {
        title: {
          $regex: filters.search,
          $options: "i"
        }
      },
      {
        company: {
          $regex: filters.search,
          $options: "i"
        }
      },
      {
        skills: {
          $elemMatch: {
            $regex: filters.search,
            $options: "i"
          }
        }
      }
    ];
  }

  const page =
    parseInt(filters.page) || 1;

  const limit =
    parseInt(filters.limit) || 10;

  const skip = (page - 1) * limit;

  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return jobs;
};

/**
 * GET SINGLE JOB
 */
const getJobById = async (id) => {
  return await Job.findById(id);
};

/**
 * CREATE JOB
 */
const createJob = async (data) => {
  return await Job.create(data);
};

/**
 * UPDATE JOB
 */
const updateJob = async (id, data) => {
  return await Job.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true
    }
  );
};

/**
 * DELETE JOB
 */
const deleteJob = async (id) => {
  return await Job.findByIdAndDelete(id);
};

/**
 * GET MY JOBS
 * based on Keycloak sub id
 */
const getMyJobs = async (subId) => {
  return await Job.find({
    createdBy: subId
  }).sort({ createdAt: -1 });
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs
};