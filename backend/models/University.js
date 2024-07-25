const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const universitySchema = new mongoose.Schema({
  name: String,
  location: String,
  established: Number,
  contact: String,
  courses: [{ name: String, duration: String }],
  rating: Number,
  placementPercentage: Number,
  image: String, // URL to the university image
  history: String,
  fees: String,
  approval: String
});

module.exports = mongoose.model('University', UniversitySchema);
