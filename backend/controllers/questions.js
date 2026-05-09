const Question = require('../models/Question');
const XLSX = require('xlsx');

// ===== 创建题目 =====
exports.create = async (req, res) => {
  try {
    const { type, difficulty, question, options, answer, explanation, tags } = req.body;

    // 验证必填字段
    if (!type || !difficulty || !question || !answer) {
      return res.status(400).json({ success: false, msg: '题目类型、难度、题目内容和答案为必填项' });
    }

    // 选择题验证选项
    if (type === 'choice') {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ success: false, msg: '选择题至少需要2个选项' });
      }
    }

    const newQuestion = await Question.create({
      type,
      difficulty,
      question,
      options: type === 'choice' ? options : [],
      answer,
      explanation: explanation || '',
      tags: tags || [],
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: newQuestion });
  } catch (err) {
    console.error('create question error:', err);
    res.status(500).json({ success: false, msg: '创建题目失败' });
  }
};

// ===== 题目列表（带筛选和分页） =====
exports.list = async (req, res) => {
  try {
    const { type, difficulty, key, page = '1', pageSize = '50' } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (key) {
      filter.$or = [
        { question: new RegExp(key, 'i') },
        { explanation: new RegExp(key, 'i') },
        { tags: new RegExp(key, 'i') },
      ];
    }

    const p = Math.max(1, parseInt(page, 10));
    const ps = Math.min(100, parseInt(pageSize, 10));
    const total = await Question.countDocuments(filter);
    const list = await Question.find(filter)
      .sort({ createdAt: -1 })
      .skip((p - 1) * ps)
      .limit(ps)
      .lean();

    res.json({ success: true, total, page: p, pageSize: ps, list });
  } catch (err) {
    console.error('list questions error:', err);
    res.status(500).json({ success: false, msg: '获取题目列表失败' });
  }
};

// ===== 随机获取练习题 =====
exports.getRandom = async (req, res) => {
  try {
    const { difficulty = 'mixed', count = '10', type } = req.query;
    const numCount = Math.min(50, Math.max(1, parseInt(count, 10)));

    const match = {};
    if (difficulty && difficulty !== 'mixed') {
      match.difficulty = difficulty;
    }
    if (type) {
      match.type = type;
    }

    const questions = await Question.aggregate([
      { $match: match },
      { $sample: { size: numCount } },
      {
        $project: {
          question: 1,
          options: 1,
          type: 1,
          difficulty: 1,
          tags: 1,
          // 练习模式不返回答案和解析
          answer: 0,
          explanation: 0,
        },
      },
    ]);

    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    console.error('getRandom questions error:', err);
    res.status(500).json({ success: false, msg: '获取练习题失败' });
  }
};

// ===== 检查练习答案 =====
exports.checkAnswers = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, msg: '请提交至少一个答案' });
    }

    // 获取所有相关题目
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    // 构建题目映射
    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id.toString()] = q;
    });

    // 逐题对比答案
    let correctCount = 0;
    const results = answers.map(a => {
      const q = questionMap[a.questionId];
      if (!q) {
        return {
          questionId: a.questionId,
          correct: false,
          msg: '题目不存在',
        };
      }

      const isCorrect = a.userAnswer && a.userAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase();
      if (isCorrect) correctCount++;

      return {
        questionId: a.questionId,
        userAnswer: a.userAnswer,
        correctAnswer: q.answer,
        correct: isCorrect,
        explanation: q.explanation || '',
      };
    });

    const total = answers.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    res.json({
      success: true,
      score,
      total,
      correctCount,
      wrongCount: total - correctCount,
      results,
    });
  } catch (err) {
    console.error('checkAnswers error:', err);
    res.status(500).json({ success: false, msg: '检查答案失败' });
  }
};

// ===== 更新题目（教师） =====
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, difficulty, question, options, answer, explanation, tags } = req.body;

    const doc = await Question.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, msg: '题目不存在' });
    }

    if (type) doc.type = type;
    if (difficulty) doc.difficulty = difficulty;
    if (question) doc.question = question;
    if (options) doc.options = options;
    if (answer) doc.answer = answer;
    if (explanation !== undefined) doc.explanation = explanation;
    if (tags) doc.tags = tags;

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('update question error:', err);
    res.status(500).json({ success: false, msg: '更新题目失败' });
  }
};

// ===== 删除题目（教师） =====
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Question.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, msg: '题目不存在' });
    }

    await Question.deleteOne({ _id: id });
    res.json({ success: true, msg: '题目已删除' });
  } catch (err) {
    console.error('remove question error:', err);
    res.status(500).json({ success: false, msg: '删除题目失败' });
  }
};

// ===== 从 Excel 批量导入题目 =====
exports.importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, msg: '请上传 Excel 文件' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, msg: 'Excel 文件中没有数据' });
    }

    let imported = 0;
    let errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        // 映射字段（支持中英文列名）
        const type = row['type'] || row['类型'];
        const difficulty = row['difficulty'] || row['难度'];
        const question = row['question'] || row['题目'];
        const answer = row['answer'] || row['答案'];
        const explanation = row['explanation'] || row['解析'] || '';
        const tagsStr = row['tags'] || row['标签'] || '';

        // 验证必填字段
        if (!type || !difficulty || !question || !answer) {
          errors.push(`第 ${i + 2} 行: 缺少必填字段(类型/难度/题目/答案)`);
          continue;
        }

        // 验证类型
        const validTypes = ['choice', 'fill', '选择题', '填空题'];
        let normalizedType;
        if (type === '选择题') normalizedType = 'choice';
        else if (type === '填空题') normalizedType = 'fill';
        else if (validTypes.includes(type)) normalizedType = type;
        else {
          errors.push(`第 ${i + 2} 行: 无效的题目类型 "${type}"`);
          continue;
        }

        // 验证难度
        const validDifficulties = ['easy', 'medium', 'hard', '简单', '中等', '困难'];
        let normalizedDifficulty;
        if (type === '简单') normalizedDifficulty = 'easy';
        else if (type === '中等') normalizedDifficulty = 'medium';
        else if (type === '困难') normalizedDifficulty = 'hard';
        else if (validDifficulties.includes(difficulty)) normalizedDifficulty = difficulty;
        else {
          errors.push(`第 ${i + 2} 行: 无效的难度 "${difficulty}"`);
          continue;
        }

        // 构建选项（选择题）
        const options = [];
        if (normalizedType === 'choice') {
          const optionA = row['optionA'] || row['选项A'];
          const optionB = row['optionB'] || row['选项B'];
          const optionC = row['optionC'] || row['选项C'];
          const optionD = row['optionD'] || row['选项D'];

          if (optionA) options.push({ label: 'A', text: optionA });
          if (optionB) options.push({ label: 'B', text: optionB });
          if (optionC) options.push({ label: 'C', text: optionC });
          if (optionD) options.push({ label: 'D', text: optionD });

          if (options.length < 2) {
            errors.push(`第 ${i + 2} 行: 选择题至少需要2个选项`);
            continue;
          }
        }

        // 解析标签
        const tags = tagsStr
          ? String(tagsStr).split(/[,，;；]/).map(t => t.trim()).filter(Boolean)
          : [];

        await Question.create({
          type: normalizedType,
          difficulty: normalizedDifficulty,
          question: String(question),
          options,
          answer: String(answer),
          explanation: String(explanation),
          tags,
          createdBy: req.user._id,
        });

        imported++;
      } catch (rowErr) {
        errors.push(`第 ${i + 2} 行: ${rowErr.message}`);
      }
    }

    res.json({
      success: true,
      imported,
      total: rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('importExcel error:', err);
    res.status(500).json({ success: false, msg: '导入题目失败' });
  }
};

// ===== 下载 Excel 模板 =====
exports.downloadTemplate = async (req, res) => {
  try {
    const templateData = [
      {
        '类型': 'choice',
        '难度': 'easy',
        '题目': 'What is the past tense of "go"?',
        '选项A': 'goed',
        '选项B': 'went',
        '选项C': 'gone',
        '选项D': 'going',
        '答案': 'B',
        '解析': '"go" 的过去式是 "went"，这是不规则动词变化。',
        '标签': '语法,动词',
      },
      {
        '类型': 'fill',
        '难度': 'medium',
        '题目': 'She has been living here _____ 2010.',
        '选项A': '',
        '选项B': '',
        '选项C': '',
        '选项D': '',
        '答案': 'since',
        '解析': '表示从过去某时开始一直持续到现在，用 "since" + 具体时间点。',
        '标签': '语法,介词',
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // 设置列宽
    ws['!cols'] = [
      { wch: 10 },  // 类型
      { wch: 10 },  // 难度
      { wch: 50 },  // 题目
      { wch: 20 },  // 选项A
      { wch: 20 },  // 选项B
      { wch: 20 },  // 选项C
      { wch: 20 },  // 选项D
      { wch: 15 },  // 答案
      { wch: 50 },  // 解析
      { wch: 20 },  // 标签
    ];

    XLSX.utils.book_append_sheet(wb, ws, '题目模板');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=question_template.xlsx');
    res.send(buffer);
  } catch (err) {
    console.error('downloadTemplate error:', err);
    res.status(500).json({ success: false, msg: '下载模板失败' });
  }
};
