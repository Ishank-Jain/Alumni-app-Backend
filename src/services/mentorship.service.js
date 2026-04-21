const Mentorship = require("../models/Mentorship.model.js");

/**
 * GET ALL MENTORS
 * Query Supported:
 * field
 * search
 * city
 * availability
 * sessionMode
 * status
 * page
 * limit
 */
const getMentorships = async (
  filters = {}
) => {
  const query = {};

  /**
   * Only approved + active by default
   */
  query.status =
    filters.status || "approved";

  query.isActive = true;

  /**
   * Filter by field
   */
  if (filters.field) {
    query.field = {
      $regex: filters.field,
      $options: "i",
    };
  }

  /**
   * Filter by city
   */
  if (filters.city) {
    query.city = {
      $regex: filters.city,
      $options: "i",
    };
  }

  /**
   * Availability
   */
  if (filters.availability) {
    query.availability =
      filters.availability;
  }

  /**
   * Session Mode
   */
  if (filters.sessionMode) {
    query.sessionMode =
      filters.sessionMode;
  }

  /**
   * Search by name/company/field/headline
   */
  if (filters.search) {
    query.$or = [
      {
        mentorName: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        company: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        field: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        headline: {
          $regex: filters.search,
          $options: "i",
        },
      },
    ];
  }

  const page =
    parseInt(filters.page) || 1;

  const limit =
    parseInt(filters.limit) || 10;

  const skip = (page - 1) * limit;

  return await Mentorship.find(
    query
  )
    .sort({
      rating: -1,
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);
};

/**
 * GET ONE MENTOR PROFILE
 */
const getMentorshipById = async (
  id
) => {
  return await Mentorship.findById(
    id
  );
};

/**
 * CREATE MENTOR PROFILE
 */
const createMentorship = async (
  data
) => {
  return await Mentorship.create(
    data
  );
};

/**
 * UPDATE PROFILE
 */
const updateMentorship = async (
  id,
  data
) => {
  return await Mentorship.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

/**
 * DELETE PROFILE
 */
const deleteMentorship = async (
  id
) => {
  return await Mentorship.findByIdAndDelete(
    id
  );
};

/**
 * MY PROFILE
 */
const getMyMentorship =
  async (subId) => {
    return await Mentorship.findOne(
      {
        mentorSub: subId,
      }
    );
  };

/**
 * APPROVE / REJECT
 */
const updateStatus = async (
  id,
  status
) => {
  return await Mentorship.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
    }
  );
};

module.exports = {
  getMentorships,
  getMentorshipById,
  createMentorship,
  updateMentorship,
  deleteMentorship,
  getMyMentorship,
  updateStatus,
};