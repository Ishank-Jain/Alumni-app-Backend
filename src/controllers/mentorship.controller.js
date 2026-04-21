const mentorshipService = require("../services/mentorship.service");

/**
 * GET /api/v1/mentorship
 * Public
 */
const getAllMentorships = async (
  req,
  res,
  next
) => {
  try {
    const mentors =
      await mentorshipService.getMentorships(
        req.query
      );

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
const getMentorshipById =
  async (req, res, next) => {
    try {
      const mentor =
        await mentorshipService.getMentorshipById(
          req.params.id
        );

      if (!mentor) {
        return res.status(404).json({
          success: false,
          message:
            "Mentor profile not found",
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
const createMentorship =
  async (req, res, next) => {
    try {
      const existing =
        await mentorshipService.getMyMentorship(
          req.dbUser.keycloakSub
        );

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "Mentorship profile already exists",
        });
      }

      const payload = {
        ...req.body,

        mentorUserId:
          req.dbUser._id,

        mentorSub:
          req.dbUser.keycloakSub,

        mentorName: `${req.dbUser.firstName || ""} ${
          req.dbUser.lastName || ""
        }`.trim(),

        mentorEmail:
          req.dbUser.email,

        status: "pending",
      };

      const mentor =
        await mentorshipService.createMentorship(
          payload
        );

      res.status(201).json({
        success: true,
        message:
          "Mentor application submitted",
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
const updateMentorship =
  async (req, res, next) => {
    try {
      const mentor =
        await mentorshipService.getMentorshipById(
          req.params.id
        );

      if (!mentor) {
        return res.status(404).json({
          success: false,
          message:
            "Mentor profile not found",
        });
      }

      const isOwner =
        mentor.mentorSub ===
        req.dbUser.keycloakSub;

      const isAdmin =
        req.user.realm_access?.roles?.includes(
          "admin"
        );

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const updated =
        await mentorshipService.updateMentorship(
          req.params.id,
          req.body
        );

      res.status(200).json({
        success: true,
        message:
          "Mentorship profile updated",
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
const deleteMentorship =
  async (req, res, next) => {
    try {
      const mentor =
        await mentorshipService.getMentorshipById(
          req.params.id
        );

      if (!mentor) {
        return res.status(404).json({
          success: false,
          message:
            "Mentor profile not found",
        });
      }

      const isOwner =
        mentor.mentorSub ===
        req.dbUser.keycloakSub;

      const isAdmin =
        req.user.realm_access?.roles?.includes(
          "admin"
        );

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      await mentorshipService.deleteMentorship(
        req.params.id
      );

      res.status(200).json({
        success: true,
        message:
          "Mentorship profile deleted",
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * GET /api/v1/mentorship/me/profile
 * Protected
 */
const getMyMentorship =
  async (req, res, next) => {
    try {
      const mentor =
        await mentorshipService.getMyMentorship(
          req.dbUser.keycloakSub
        );

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
const updateMentorshipStatus =
  async (req, res, next) => {
    try {
      const updated =
        await mentorshipService.updateStatus(
          req.params.id,
          req.body.status
        );

      res.status(200).json({
        success: true,
        message:
          "Status updated successfully",
        data: updated,
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
};