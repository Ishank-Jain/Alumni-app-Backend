const Mentorship = require('../models/mentorship.model');

// GET all
const getMentorships = async (filters) => {
  const query = {};

  if (filters.field) query.field = filters.field;

  return await Mentorship.find(query);
};

// GET by ID
const getMentorshipById = async (id) => {
  return await Mentorship.findById(id);
};

// CREATE
const createMentorship = async (data) => {
  return await Mentorship.create(data);
};

// UPDATE
const updateMentorship = async (id, data) => {
  return await Mentorship.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
const deleteMentorship = async (id) => {
  return await Mentorship.findByIdAndDelete(id);
};

module.exports = {
  getMentorships,
  getMentorshipById,
  createMentorship,
  updateMentorship,
  deleteMentorship,
};