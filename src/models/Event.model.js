const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },

  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },

  date: {
    type: Date,
    required: true,
    index: true
  },

  endDate: {
    type: Date
  },

  location: {
    type: String,
    trim: true,
    maxlength: 200
  },

  mode: {
    type: String,
    enum: ["offline", "online", "hybrid"],
    default: "offline"
  },

  meetingLink: {
    type: String,
    default: ""
  },

  capacity: {
    type: Number,
    default: 0
  },

  registrationsCount: {
    type: Number,
    default: 0
  },

  bannerImage: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: [
      "draft",
      "published",
      "cancelled",
      "completed"
    ],
    default: "published",
    index: true
  },

  visibility: {
    type: String,
    enum: [
      "public",
      "students",
      "alumni",
      "private"
    ],
    default: "public"
  },

  createdByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  createdBySub: {
    type: String,
    required: true,
    index: true
  },

  organizerName: {
    type: String,
    default: ""
  },

  organizerEmail: {
    type: String,
    default: ""
  }
},
{
  timestamps: true,
  versionKey: false
}
);

EventSchema.index({
  date: 1,
  status: 1
});

module.exports =
mongoose.model("Event", EventSchema);