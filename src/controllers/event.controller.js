const eventService = require('../services/events.service');

const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getEvents(req.query);

    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    next(err);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent({
      ...req.body,
      organizer: req.user._id
    });

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);

    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);

    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};