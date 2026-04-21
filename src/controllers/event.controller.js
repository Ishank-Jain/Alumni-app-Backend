const eventService = require("../services/events.service");

/**
 * GET /api/v1/events
 */
const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getEvents(req.query);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/events
 * Protected:
 * verifyToken -> syncMongoUser -> checkRole
 */
const createEvent = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,

      createdByUserId: req.dbUser._id,
      createdBySub: req.dbUser.keycloakSub,

      organizerName: `${req.dbUser.firstName || ""} ${req.dbUser.lastName || ""}`.trim(),

      organizerEmail: req.dbUser.email,
    };

    const event = await eventService.createEvent(payload);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/events/:id
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const isOwner =
      event.createdBySub === req.dbUser.keycloakSub;

    const isAdmin =
      req.user.realm_access?.roles?.includes("admin");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const updatedEvent =
      await eventService.updateEvent(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/events/:id
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const isOwner =
      event.createdBySub === req.dbUser.keycloakSub;

    const isAdmin =
      req.user.realm_access?.roles?.includes("admin");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    await eventService.deleteEvent(req.params.id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};