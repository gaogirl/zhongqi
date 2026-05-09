const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  // 题目类型: choice(选择题), fill(填空题)
  type: { type: String, enum: ['choice', 'fill'], required: true },
  // 难度: easy(简单), medium(中等), hard(困难)
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  // 题目文本（中文或英文原文）
  question: { type: String, required: true },
  // 选项（仅选择题使用）
  options: [{
    label: String,    // A, B, C, D
    text: String      // 选项内容
  }],
  // 正确答案
  answer: { type: String, required: true },
  // 解析说明
  explanation: String,
  // 知识点标签
  tags: [String],
  // 创建者（教师）
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
