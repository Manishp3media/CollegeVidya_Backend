const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UniversitySchema = new Schema({
  name: { type: String, required: true },
  location: String,
  established: Number,
  programs: [{ type: Schema.Types.ObjectId, ref: 'Program' }]
});

module.exports = mongoose.model('University', UniversitySchema);
