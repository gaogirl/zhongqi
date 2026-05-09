const mongoose = require('mongoose');
const { Schema } = mongoose;

const CaseSchema = new Schema({
  title: { type: String, required: true, index: true },
  domain: { type: String, index: true },
  summary: { type: String },
  content: { type: String }, // 富文本或 Markdown
  tags: [{ type: String, index: true }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  // 美观展示字段
  coverImage: { type: String, default: '📖' },
  gradient: {
    from: { type: String, default: '#667eea' },
    to: { type: String, default: '#764ba2' }
  },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  estimatedTime: { type: String, default: '30分钟' },
}, { timestamps: true });

module.exports = mongoose.model('cases', CaseSchema);
