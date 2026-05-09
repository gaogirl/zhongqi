const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const chatController = require('../../controllers/chat');

// @route   POST api/chat
// @desc    Handle chat requests
// @access  Private
router.post('/', protect, chatController.handleChat);

module.exports = router;
