const mentorshipService = require("../services/mentorship.service");
const User = require("../models/User.model"); // NEW: Added to support direct User updates

/**
 * GET /api/v1/mentorship
 * Public
 */
const getAllMentorships = async (req, res, next) => {
  try {
    const mentors = await mentorshipService.getMentorships(req.query);
    res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/mentorship/:id
 * Public
 */
const getMentorshipById = async (req, res, next) => {
  try {
    const mentor = await mentorshipService.getMentorshipById(req.params.id);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }
    res.status(200).json({
      success: true,
      data: mentor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/mentorship
 * Protected
 * Become Mentor
 */
const createMentorship = async (req, res, next) => {
  try {
    const existing = await mentorshipService.getMyMentorship(req.dbUser.keycloakSub);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Mentorship profile already exists",
      });
    }

    const payload = {
      ...req.body,
      mentorUserId: req.dbUser._id,
      mentorSub: req.dbUser.keycloakSub,
      mentorName: `${req.dbUser.firstName || ""} ${req.dbUser.lastName || ""}`.trim(),
      mentorEmail: req.dbUser.email,
      status: "pending",
    };

    const mentor = await mentorshipService.createMentorship(payload);

    res.status(201).json({
      success: true,
      message: "Mentor application submitted",
      data: mentor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/mentorship/:id
 * Owner or Admin
 */
const updateMentorship = async (req, res, next) => {
  try {
    const mentor = await mentorshipService.getMentorshipById(req.params.id);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }

    const isOwner = mentor.mentorSub === req.dbUser.keycloakSub;
    const isAdmin = req.user.realm_access?.roles?.includes("admin");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updated = await mentorshipService.updateMentorship(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Mentorship profile updated",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/mentorship/:id
 * Owner or Admin
 */
const deleteMentorship = async (req, res, next) => {
  try {
    const mentor = await mentorshipService.getMentorshipById(req.params.id);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }

    const isOwner = mentor.mentorSub === req.dbUser.keycloakSub;
    const isAdmin = req.user.realm_access?.roles?.includes("admin");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await mentorshipService.deleteMentorship(req.params.id);
    res.status(200).json({
      success: true,
      message: "Mentorship profile deleted",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/mentorship/me/profile
 * Protected
 */
const getMyMentorship = async (req, res, next) => {
  try {
    const mentor = await mentorshipService.getMyMentorship(req.dbUser.keycloakSub);
    res.status(200).json({
      success: true,
      data: mentor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/mentorship/:id/status
 * Admin Only
 */
const updateMentorshipStatus = async (req, res, next) => {
  try {
    const updated = await mentorshipService.updateStatus(req.params.id, req.body.status);
    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/* ====================================================
   NEW FEATURE: Instant User-Model Registration Flow 
   These power the React Dashboard endpoints
   ==================================================== */

const registerMentor = async (req, res, next) => {
  try {
    const user = req.dbUser;

    if (user.isMentor) {
      return res.status(400).json({ success: false, message: "You are already registered as a mentor." });
    }

    // 1. Save the details from the frontend form directly to the User model
    user.isMentor = true;
    user.mentorDetails = {
      expertise: req.body.expertise,
      experience: req.body.experience,
      linkedinUrl: req.body.linkedinUrl,
      maxStudents: req.body.maxStudents || 5
    };
    
    if (!user.enrolledStudents) user.enrolledStudents = [];

    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Successfully registered as a mentor!", 
      data: user 
    });
  } catch (error) {
    next(error);
  }
};

const getMyMentorshipDetails = async (req, res, next) => {
  try {
    // Fetch the user and populate the enrolled students' basic details
    const user = await User.findById(req.dbUser._id)
      .populate('enrolledStudents', 'firstName lastName email batch');

    if (!user || !user.isMentor) {
      return res.status(404).json({ success: false, message: "Not registered as a mentor yet." });
    }

    res.status(200).json({
      success: true,
      data: {
        mentorProfile: user.mentorDetails,
        enrolledStudents: user.enrolledStudents || []
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMentorships,
  getMentorshipById,
  createMentorship,
  updateMentorship,
  deleteMentorship,
  getMyMentorship,
  updateMentorshipStatus,
  registerMentor,          // NEW
  getMyMentorshipDetails,  // NEW
};