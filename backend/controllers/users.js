const User = require('../models/User');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Term = require('../models/Term');
const Case = require('../models/Case');

// @desc    获取学生个人数据统计
// @route   GET /api/users/stats
// @access  Private
exports.getStudentStats = async (req, res) => {
  try {
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

    // 5. 计算话题熟悉度（基于作业类型和方向）
    const topicStats = {
      '中译英': 0,
      '英译中': 0,
      '口译': 0,
      '朗读': 0
    };

    submissions.forEach(sub => {
      if (sub.assignment) {
        const type = sub.assignment.type;
        const direction = sub.assignment.direction;
        
        if (type === 'translate') {
          if (direction === 'zh-en') topicStats['中译英']++;
          else if (direction === 'en-zh') topicStats['英译中']++;
        } else if (type === 'interpret') {
          topicStats['口译']++;
        } else if (type === 'read') {
          topicStats['朗读']++;
        }
      }
    });

    // 归一化话题熟悉度（0-100）
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
    const strengths = [];
    const weaknesses = [];
    
    if (topicFamiliarity['中译英'] > 70) strengths.push('中译英');
    if (topicFamiliarity['英译中'] > 70) strengths.push('英译中');
    if (topicFamiliarity['口译'] > 70) strengths.push('口译');
    if (topicFamiliarity['朗读'] > 70) strengths.push('朗读');
    
    if (topicFamiliarity['中译英'] < 40) weaknesses.push('中译英');
    if (topicFamiliarity['英译中'] < 40) weaknesses.push('英译中');
    if (topicFamiliarity['口译'] < 40) weaknesses.push('口译');
    if (topicFamiliarity['朗读'] < 40) weaknesses.push('朗读');

    // 生成建议
    const suggestions = [];
    if (weaknesses.length > 0) {
      suggestions.push(`加强${weaknesses.join('、')}练习`);
    }
    if (avgAiScore < 60) {
      suggestions.push('术语积累');
      suggestions.push('口语流畅度训练');
    }
    if (submissions.length < 5) {
      suggestions.push('增加练习频率');
    }

    // 7. 计算总学习时长（估算：每次提交平均15分钟）
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
      if (studyDates[i] === expectedDate.getTime()) {
        streakDays++;
      } else {
        break;
      }
    }

    // 9. 获取最近评测结果（用于AI评分详情）
    const recentEvals = evalSubmissions.slice(0, 5).map(s => ({
      assignmentTitle: s.assignment?.title || '未知作业',
      aiScore: s.aiScore,
      submittedAt: s.submittedAt
    }));

    res.json({
      // 学习进度
      studyProgress: {
        streakDays,
        totalStudyHours,
        last7Days: last7Days.map(d => ({ day: d.dateStr, count: d.count }))
      },
      // 话题熟悉度
      topicFamiliarity,
      // AI评测
      aiAssessment: {
        overallScore: avgAiScore,
        level: avgAiScore >= 80 ? '优秀' : avgAiScore >= 60 ? '良好' : avgAiScore >= 40 ? '及格' : '待提高',
        strengths: strengths.length > 0 ? strengths : ['基础扎实'],
        weaknesses: weaknesses.length > 0 ? weaknesses : ['继续保持'],
        suggestions: suggestions.length > 0 ? suggestions : ['保持练习频率'],
        recentEvals
      },
      // 统计数据
      stats: {
        totalSubmissions: submissions.length,
        totalAssignments: assignments.length,
        completedAssignments: submissions.filter(s => s.status === 'graded').length,
        avgScore: evalSubmissions.length > 0 ? avgAiScore : 0
      }
    });
  } catch (e) {
    console.error('getStudentStats error', e);
    res.status(500).json({ error: '获取统计数据失败' });
  }
};

// @desc    更新用户资料
// @route   PATCH /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body || {};
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ error: '用户不存在' });
    
    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof avatar === 'string') user.avatar = avatar;
    
    await user.save();
