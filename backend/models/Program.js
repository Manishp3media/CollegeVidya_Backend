const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProgramSchema = new Schema({
  name: { type: String, required: true },
  duration: String,
  fees: Number,
  university: { type: Schema.Types.ObjectId, ref: 'University' },
  details: String,
  accreditation: String
});

module.exports = mongoose.model('Program', ProgramSchema);
