const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },

  company: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },

  location: {
    type: String,
    trim: true,
    maxlength: 120
  },

  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },

  employmentType: {
    type: String,
    enum: [
      "full-time",
      "part-time",
      "internship",
      "contract",
      "remote"
    ],
    default: "full-time"
  },

  salary: {
    type: String,
    trim: true,
    default: "Not disclosed"
  },

  skills: [{
    type: String,
    trim: true
  }],

  applicationDeadline: {
    type: Date
  },

  isActive: {
    type: Boolean,
    default: true
  },

  /**
   * Main identity mapping from Keycloak/PostgreSQL
   * NOT Mongo _id relation
   */
  createdBy: {
    type: String,
    required: true,
    index: true
  },

  /**
   * Optional cache fields from postgres user table
   */
  createdByUsername: {
    type: String,
    trim: true
  },

  createdByRole: {
    type: String,
    trim: true
  }

},
{
  timestamps: true
}
);

module.exports = mongoose.model("Job", JobSchema);