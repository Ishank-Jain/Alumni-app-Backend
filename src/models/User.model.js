const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{
  keycloakSub: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },

  firstName: {
    type: String,
    trim: true,
    default: ""
  },

  lastName: {
    type: String,
    trim: true,
    default: ""
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  role: {
    type: String,
    enum: [
      "student",
      "alumni",
      "mentor",
      "recruiter",
      "admin"
    ],
    default: "student",
    index: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  profileCompleted: {
    type: Boolean,
    default: false
  },

  banned: {
    type: Boolean,
    default: false
  },

  bannedReason: {
    type: String,
    default: ""
  },

  lastLoginAt: Date,

  batch: Number,

  company: {
    type: String,
    trim: true,
    index: true
  },

  designation: {
    type: String,
    trim: true
  },

  city: {
    type: String,
    trim: true
  },

  course: String,

  enrollmentYear: Number,

  bio: {
    type: String,
    maxlength: 500,
    default: ""
  },

  profilePicture: {
    type: String,
    default: ""
  },

  linkedin: String,
  github: String,

  kycStatus: {
    type: String,
    enum: [
      "not_submitted",
      "pending",
      "verified",
      "rejected"
    ],
    default: "not_submitted"
  }
},
{
  timestamps: true,
  versionKey: false
}
);

UserSchema.index({
  batch: 1,
  company: 1
});

UserSchema.methods.toPublicJSON =
function () {
  return this.toObject();
};

module.exports =
mongoose.model("User", UserSchema);