const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ComparisonSchema = new Schema({
  user: { type: String, required: true },
  universities: [{ type: Schema.Types.ObjectId, ref: 'University' }],
  programs: [{ type: Schema.Types.ObjectId, ref: 'Program' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comparison', ComparisonSchema);
