const Event = require("../models/Event.model.js");

/**
 * GET ALL EVENTS
 * Filters:
 * search
 * status
 * mode
 * visibility
 * upcoming
 * page
 * limit
 */

const getEvents = async (filters) => {
  const query = {};

  /**
   * Search by title / description / location
   */
  if (filters.search) {
    query.$or = [
      {
        title: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: filters.search,
          $options: "i",
        },
      },
      {
        location: {
          $regex: filters.search,
          $options: "i",
        },
      },
    ];
  }

  /**
   * Status filter
   */
  if (filters.status) {
    query.status = filters.status;
  }

  /**
   * Mode filter
   */
  if (filters.mode) {
    query.mode = filters.mode;
  }

  /**
   * Visibility filter
   */
  if (filters.visibility) {
    query.visibility =
      filters.visibility;
  }

  /**
   * Upcoming only
   */
  if (filters.upcoming === "true") {
    query.date = {
      $gte: new Date(),
    };
  }

  const page =
    parseInt(filters.page) || 1;

  const limit =
    parseInt(filters.limit) || 10;

  const skip = (page - 1) * limit;

  const events = await Event.find(query)
    .sort({ date: 1 })
    .skip(skip)
    .limit(limit);

  return events;
};

/**
 * GET EVENT BY ID
 */
const getEventById = async (id) => {
  return await Event.findById(id);
};

/**
 * CREATE EVENT
 */
const createEvent = async (data) => {
  return await Event.create(data);
};

/**
 * UPDATE EVENT
 */
const updateEvent = async (
  id,
  data
) => {
  return await Event.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

/**
 * DELETE EVENT
 */
const deleteEvent = async (id) => {
  return await Event.findByIdAndDelete(id);
};

/**
 * GET MY EVENTS
 * based on keycloak sub
 */
const getMyEvents = async (
  subId
) => {
  return await Event.find({
    createdBySub: subId,
  }).sort({
    createdAt: -1,
  });
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
};