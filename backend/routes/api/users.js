const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 导入用户模型
const User = require('../../models/User');

// 导入认证中间件
const auth = require('../../middleware/auth');

// @route   GET api/users/test
// @desc    测试用户路由
// @access  Public
router.get('/test', (req, res) => res.json({ msg: '用户路由工作正常' }));

// @route   POST api/users/register
// @desc    注册用户
// @access  Public
router.post('/register', (req, res) => {
    // 查找数据库中是否已存在该邮箱
    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(400).json({ email: '邮箱已被注册' });
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                role: req.body.role
            });

            // 加密密码
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        }
    });
});

// @route   POST api/users/login
// @desc    登录用户 / 返回 JWT Token
// @access  Public
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // 在数据库中查找用户
    User.findOne({ email }).then(user => {
        // 检查用户是否存在
        if (!user) {
            return res.status(404).json({ emailnotfound: '未找到用户' });
        }

        // 检查密码是否匹配
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // 用户匹配成功，创建 JWT Payload
                const payload = { id: user.id, name: user.name, role: user.role };

                // 签发 Token
                jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: 3600 }, // 1小时后过期
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                    }
                );
            } else {
                return res
                    .status(400)
                    .json({ passwordincorrect: '密码不正确' });
            }
        });
    });
});

// @route   GET api/users/stats
// @desc    获取学生个人数据统计
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const Class = require('../../models/Class');
    const Assignment = require('../../models/Assignment');
    const Submission = require('../../models/Submission');

    const userId = req.user._id;

    // 1. 获取用户加入的所有班级
    const classes = await Class.find({ members: userId });
    const classIds = classes.map(c => c._id);

    // 2. 获取所有相关作业
    const assignments = await Assignment.find({ class: { $in: classIds } });
    const assignmentIds = assignments.map(a => a._id);

    // 3. 获取用户的所有提交
    const submissions = await Submission.find({ student: userId })
      .populate('assignment', 'title type direction createdAt')
      .sort({ submittedAt: -1 });

    // 4. 计算学习进度数据（最近7天）
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push({
        date: date,
        dateStr: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        count: 0
      });
    }

    submissions.forEach(sub => {
      const subDate = new Date(sub.submittedAt);
      subDate.setHours(0, 0, 0, 0);
      const dayData = last7Days.find(d => d.date.getTime() === subDate.getTime());
      if (dayData) dayData.count++;
    });

    // 5. 计算话题熟悉度
    const topicStats = { '中译英': 0, '英译中': 0, '口译': 0, '朗读': 0 };
    submissions.forEach(sub => {
      if (sub.assignment) {
        const { type, direction } = sub.assignment;
        if (type === 'translate') {
          if (direction === 'zh-en') topicStats['中译英']++;
          else if (direction === 'en-zh') topicStats['英译中']++;
        } else if (type === 'interpret') topicStats['口译']++;
        else if (type === 'read') topicStats['朗读']++;
      }
    });

    const maxCount = Math.max(...Object.values(topicStats), 1);
    const topicFamiliarity = {
      '中译英': Math.round((topicStats['中译英'] / maxCount) * 100),
      '英译中': Math.round((topicStats['英译中'] / maxCount) * 100),
      '口译': Math.round((topicStats['口译'] / maxCount) * 100),
      '朗读': Math.round((topicStats['朗读'] / maxCount) * 100)
    };

    // 6. 计算AI评测数据
    const evalSubmissions = submissions.filter(s => s.aiScore !== null && s.aiScore !== undefined);
    const avgAiScore = evalSubmissions.length > 0
      ? Math.round(evalSubmissions.reduce((sum, s) => sum + s.aiScore, 0) / evalSubmissions.length)
      : 0;

    // 分析优势和劣势
    const strengths = [], weaknesses = [];
    Object.entries(topicFamiliarity).forEach(([topic, value]) => {
      if (value > 70) strengths.push(topic);
      if (value < 40) weaknesses.push(topic);
    });

    const suggestions = [];
    if (weaknesses.length > 0) suggestions.push(`加强${weaknesses.join('、')}练习`);
    if (avgAiScore < 60) suggestions.push('术语积累', '口语流畅度训练');
    if (submissions.length < 5) suggestions.push('增加练习频率');

    // 7. 计算总学习时长
    const totalStudyHours = Math.round((submissions.length * 15) / 60 * 10) / 10;

    // 8. 计算连续学习天数
    const studyDates = [...new Set(submissions.map(s => {
      const d = new Date(s.submittedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }))].sort((a, b) => b - a);

    let streakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < studyDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      if (studyDates[i] === expectedDate.getTime()) streakDays++;
      else break;
    }

    res.json({
      studyProgress: {
        streakDays,
        totalStudyHours,
        last7Days: last7Days.map(d => ({ day: d.dateStr, count: d.count }))
      },
      topicFamiliarity,
      aiAssessment: {
        overallScore: avgAiScore,
        level: avgAiScore >= 80 ? '优秀' : avgAiScore >= 60 ? '良好' : avgAiScore >= 40 ? '及格' : '待提高',
        strengths: strengths.length > 0 ? strengths : ['基础扎实'],
        weaknesses: weaknesses.length > 0 ? weaknesses : ['继续保持'],
        suggestions: suggestions.length > 0 ? suggestions : ['保持练习频率']
      },
      stats: {
        totalSubmissions: submissions.length,
        totalAssignments: assignments.length,
        avgScore: avgAiScore
      }
    });
  } catch (e) {
    console.error('getStudentStats error', e);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// @route   PATCH api/users/profile
// @desc    更新用户资料
// @access  Private
router.patch('/profile', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof avatar === 'string') user.avatar = avatar;
    await user.save();
    res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (e) {
    console.error('updateProfile error', e);
    res.status(500).json({ error: '更新资料失败' });
  }
});

module.exports = router;
