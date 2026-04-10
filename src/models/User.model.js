const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    // Role
    role: {
      type: String,
      enum: ['student', 'alumni', 'admin'],
      default: 'student',
    },

    // Alumni Fields
    batch: {
      type: Number,
      index: true,
    },

    company: {
      type: String,
      trim: true,
      index: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },

    profilePicture: {
      type: String,
      default: '',
    },

    // Student Fields
    enrollmentYear: Number,
    course: String,

    // Social Links
    linkedin: {
      type: String,
      trim: true,
    },

    github: {
      type: String,
      trim: true,
    },

    // Auth
    refreshToken: {
      type: String,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // KYC
    kycStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'verified', 'rejected'],
      default: 'not_submitted',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
UserSchema.index({ batch: 1, company: 1 });
UserSchema.index({ role: 1 });

// Hide sensitive fields
UserSchema.methods.toPublicJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};

module.exports = mongoose.model('User', UserSchema);