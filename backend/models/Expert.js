const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expertSchema = new mongoose.Schema({
  name: String,
  designation: String,
  department: String,
  contact: String,
  email: String,
  expertise: [String], // Array of expertise areas
  image: String, // URL to the expert's image
  biography: String,
  rating: Number
});

module.exports = mongoose.model('Expert', expertSchema);
