const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const translateController = require('../../controllers/translate');

// @route   POST api/translate
// @desc    Translate text using ZhipuAI
// @access  Private
router.post('/', protect, translateController.handleTranslate);

module.exports = router;
