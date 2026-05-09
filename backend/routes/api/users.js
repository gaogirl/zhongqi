const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const usersController = require('../../controllers/users');

// @route   GET api/users/stats
// @desc    获取学生个人数据统计
// @access  Private
router.get('/stats', protect, usersController.getStudentStats);

// @route   PATCH api/users/profile
// @desc    更新用户资料
// @access  Private
router.patch('/profile', protect, usersController.updateProfile);

module.exports = router;
