const mongoose = require('mongoose');

const MentorshipSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  field: {
    type: String,
    required: true,
    trim: true,
  },

  experience: {
    type: String, // e.g. "3 years"
  },

  availability: {
    type: String, // e.g. "Weekends"
  },

}, { timestamps: true });

module.exports = mongoose.model('Mentorship', MentorshipSchema);