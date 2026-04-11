const mentorshipService = require('../services/mentorship.service');

const getAllMentorships = async (req, res, next) => {
  try {
    const data = await mentorshipService.getMentorships(req.query);

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

const getMentorshipById = async (req, res, next) => {
  try {
    const data = await mentorshipService.getMentorshipById(req.params.id);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// const createMentorship = async (req, res, next) => {
//   try {
//     const data = await mentorshipService.createMentorship({
//       ...req.body,
//       mentor: req.user._id
//     });

//     res.status(201).json({ success: true, data });
//   } catch (err) {
//     next(err);
//   }
// };
const createMentorship = async (req, res, next) => {
  try {
    // Just pass req.body directly to the service
    const data = await mentorshipService.createMentorship(req.body);

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const updateMentorship = async (req, res, next) => {
  try {
    const data = await mentorshipService.updateMentorship(req.params.id, req.body);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const deleteMentorship = async (req, res, next) => {
  try {
    await mentorshipService.deleteMentorship(req.params.id);

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMentorships,
  getMentorshipById,
  createMentorship,
  updateMentorship,
  deleteMentorship,
};