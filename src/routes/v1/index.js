const express = require('express')
const router = express.Router()

/**
 * v1 Router — aggregates all route modules
 * Each route module is self-contained
 *
 * Add new routes here as you build them:
 * router.use('/users', require('./user.routes'))
 * router.use('/mentorship', require('./mentorship.routes'))
 * router.use('/jobs', require('./job.routes'))
 * router.use('/events', require('./event.routes'))
 */

router.use('/auth', require('./auth.routes'))
router.use('/users',      require('./user.routes'))
router.use('/mentorship', require('./mentorship.routes'))
router.use('/jobs',       require('./job.routes'))
router.use('/events',     require('./event.routes'))

module.exports = router