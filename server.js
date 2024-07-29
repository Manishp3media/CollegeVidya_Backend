require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/images', express.static(path.join(__dirname, 'images')));

mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
})
  .then(() => {
    console.log('MongoDB connected');
    insertDummyUniversities();
    insertDummyExperts();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

const _dirname = path.dirname("");
const buildpath = path.join(_dirname, "../Frontend/build");
app.use(express.static(buildpath));

// University Schema and Model
const universitySchema = new mongoose.Schema({
  name: String,
  location: String,
  established: Number,
  contact: String,
  whatsapp: String,
  courses: [{ name: String, duration: String }],
  rating: Number,
  placementPercentage: Number,
  image: String,
  campusSize: String,
  history: String,
  fees: String,
  approval: String
});

const University = mongoose.model('University', universitySchema);

// Expert Schema and Model
const expertSchema = new mongoose.Schema({
  name: String,
  designation: String,
  experience: Number,
  contact: String,
  email: String,
  image: String,
  bio: String
});

const Expert = mongoose.model('Expert', expertSchema);

// User Schema and Model
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  phone: String,
  resetToken: String,
  resetTokenExpire: Date,
  state: String,
  country: String,
  gender: String,
  dob: Date
});

const User = mongoose.model('User', userSchema);

async function insertDummyUniversities() {
  const dummyUniversities = [
    {
      name: 'Indian University',
      location: 'Delhi',
      established: 1947,
      contact: '+91 7643344566',
      whatsapp: '+91 7642335566',
      courses: [{ name: 'MBA', duration: '2 years' }],
      rating: 4,
      placementPercentage: 85,
      image: 'Delhi.png',
      campusSize: '320 acres',
      history: 'DU fees range from INR 4000 to INR 50,000 in all the affiliated colleges. Delhi University UG admissions are done through CUET UG, for which the general category registration fee is INR 750. Fees for DU BA courses range from INR 4800 to INR 21,000. DU B.Com fees range from INR 8000 to INR 30,000.',
      fees: '100000/year',
      approval: 'UGC | AICTE | NIRF | WES | NAAC A+ | QS World'
    }
  ];

  try {
    await University.insertMany(dummyUniversities);
    console.log('Dummy universities inserted successfully');
  } catch (err) {
    console.error('Error inserting dummy universities:', err);
  }
}

async function insertDummyExperts() {
  const dummyExperts = [
    {
      name: 'Dr. Doe',
      designation: 'Professor of Computer Science',
      experience: 15,
      contact: '+91 9876543210',
      email: 'john.doe@example.com',
      image: 'John.png',
      bio: 'Dr. John Doe is a renowned professor with over 15 years of experience in computer science, specializing in AI and machine learning.'
    },
    {
      name: 'Dr. Smith',
      designation: 'Professor of Mechanical Engineering',
      experience: 20,
      contact: '+91 8765432109',
      email: 'jane.smith@example.com',
      image: 'Smith.png',
      bio: 'Dr. Jane Smith has extensive experience in mechanical engineering and is known for her groundbreaking research in renewable energy systems.'
    }
  ];

  try {
    await Expert.insertMany(dummyExperts);
    console.log('Dummy experts inserted successfully');
  } catch (err) {
    console.error('Error inserting dummy experts:', err);
  }
}

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

app.post('/api/register', async (req, res) => {
  const { username, email, password, phone, gender, country, state, dob } = req.body;
  
  try {
    const newUser = new User({ username, email, password, phone, gender, country, state, dob });
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    if (password !== user.password) return res.status(401).json({ error: 'Invalid email or password' });

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: 'your-email@gmail.com',
      subject: 'Password Reset',
      text: `You requested for password reset. Please click on this link to reset your password: ${resetUrl}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ error: 'Error sending email' });
      }
      res.status(200).json({ message: 'Password reset email sent' });
    });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }

  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/universities', async (req, res) => {
  try {
    const universities = await University.find();
    res.status(200).json(universities);
  } catch (err) {
    console.error('Error fetching universities:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/university/:id', async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    res.status(200).json(university);
  } catch (err) {
    console.error('Error fetching university:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch all experts
app.get('/api/experts', async (req, res) => {
  try {
    const experts = await Expert.find();
    res.status(200).json(experts);
  } catch (err) {
    console.error('Error fetching experts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch a single expert by ID
app.get('/api/expert/:id', async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }
    res.status(200).json(expert);
  } catch (err) {
    console.error('Error fetching expert:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new expert
app.post('/api/expert', async (req, res) => {
  const { name, designation, experience, contact, email, image, bio } = req.body;
  
  if (!name || !designation || !experience || !contact || !email || !image || !bio) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newExpert = new Expert({ name, designation, experience, contact, email, image, bio });
    await newExpert.save();
    res.status(201).json({ message: 'Expert created successfully', expert: newExpert });
  } catch (err) {
    console.error('Error creating expert:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing expert
app.put('/api/expert/:id', async (req, res) => {
  const { name, designation, experience, contact, email, image, bio } = req.body;

  try {
    const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, { name, designation, experience, contact, email, image, bio }, { new: true });
    if (!updatedExpert) {
      return res.status(404).json({ error: 'Expert not found' });
    }
    res.status(200).json({ message: 'Expert updated successfully', expert: updatedExpert });
  } catch (err) {
    console.error('Error updating expert:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an expert
app.delete('/api/expert/:id', async (req, res) => {
  try {
    const deletedExpert = await Expert.findByIdAndDelete(req.params.id);
    if (!deletedExpert) {
      return res.status(404).json({ error: 'Expert not found' });
    }
    res.status(200).json({ message: 'Expert deleted successfully' });
  } catch (err) {
    console.error('Error deleting expert:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
