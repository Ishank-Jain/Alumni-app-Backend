const Event = require('../models/event.model');

// GET all
const getEvents = async (filters) => {
  const query = {};

  if (filters.search) {
    query.title = { $regex: filters.search, $options: 'i' };
  }

  return await Event.find(query);
};

// GET by ID
const getEventById = async (id) => {
  return await Event.findById(id);
};

// CREATE
const createEvent = async (data) => {
  return await Event.create(data);
};

// UPDATE
const updateEvent = async (id, data) => {
  return await Event.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
const deleteEvent = async (id) => {
  return await Event.findByIdAndDelete(id);
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};