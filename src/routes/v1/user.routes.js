const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const { protect } = require('../../middlewares/auth.middleware');

/**
 * User Routes — /api/v1/users
 */

// Public
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Protected
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, userController.deleteUser);

module.exports = router;