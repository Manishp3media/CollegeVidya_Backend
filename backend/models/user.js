const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: false },
  state: { type: String, required: false },
  country: { type: String, required: false },
  dob: { type: Date, required: false }, // Add this line
});

const User = mongoose.model('User', userSchema);

module.exports = User;

