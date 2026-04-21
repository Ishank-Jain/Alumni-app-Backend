const mongoose = require("mongoose");

const MentorshipSchema = new mongoose.Schema(
{
  /**
   * Identity Mapping
   */
  mentorUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  mentorSub: {
    type: String,
    required: true,
    index: true,
    unique: true
  },

  mentorName: {
    type: String,
    required: true,
    trim: true
  },

  mentorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },

  /**
   * Profile
   */
  field: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },

  headline: {
    type: String,
    trim: true,
    maxlength: 180,
    default: ""
  },

  company: {
    type: String,
    trim: true,
    maxlength: 120,
    default: ""
  },

  designation: {
    type: String,
    trim: true,
    maxlength: 120,
    default: ""
  },

  experienceYears: {
    type: Number,
    default: 0,
    min: 0
  },

  bio: {
    type: String,
    maxlength: 1000,
    default: ""
  },

  skills: [{
    type: String,
    trim: true
  }],

  /**
   * Availability
   */
  availability: {
    type: String,
    enum: [
      "weekdays",
      "weekends",
      "evenings",
      "flexible"
    ],
    default: "flexible"
  },

  sessionMode: {
    type: String,
    enum: [
      "online",
      "offline",
      "hybrid"
    ],
    default: "online"
  },

  city: {
    type: String,
    trim: true,
    default: ""
  },

  /**
   * Status
   */
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "rejected",
      "inactive"
    ],
    default: "pending",
    index: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  /**
   * Stats
   */
  totalSessions: {
    type: Number,
    default: 0
  },

  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
},
{
  timestamps: true,
  versionKey: false
}
);

MentorshipSchema.index({
  field: 1,
  status: 1
});

module.exports =
mongoose.model(
  "Mentorship",
  MentorshipSchema
);