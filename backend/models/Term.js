const mongoose = require('mongoose');
const { Schema } = mongoose;

const TermSchema = new Schema({
  term: { type: String, required: true, index: true },
  meaning: { type: String, required: true },
  cat: { type: String, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'users' },
  // 美观展示字段
  icon: { type: String, default: '📚' },
  gradient: {
    from: { type: String, default: '#667eea' },
    to: { type: String, default: '#764ba2' }
  },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
}, { timestamps: true });

module.exports = mongoose.model('terms', TermSchema);
