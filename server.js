const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/images', express.static(path.join(__dirname, 'images')));

mongoose.connect('mongodb://127.0.0.1:27017/college-vidya', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
})
  .then(() => {
    console.log('MongoDB connected');
    insertDummyUniversities();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

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
});

const University = mongoose.model('University', universitySchema);

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  phone: String,
  resetToken: String,
  resetTokenExpire: Date,
});

const User = mongoose.model('User', userSchema);

async function insertDummyUniversities() {
  const dummyUniversities = [
    { 
      name: 'Mangalore University', 
      location: 'Kolkata', 
      established: 1949, 
      contact: '+91 9002345546', 
      whatsapp: '+91 9002345546',
      courses: [{ name: 'BBA', duration: '2 years' }], 
      rating: 3, 
      placementPercentage: 55, 
      image: 'Kolkata.png', 
      campusSize: '100 acres',
      history: 'In Kolkata, there are 25 universities. Out of which 17 are government and the rest 8 are privately held. Some of the best universities are Jadavpur University, WBSU, Calcutta University, UEM, etc. The lowest fee offered by the best university is 1.80k. The highest offered fee is 28.3lakh. University fees depend upon the courses and universities. These universities specialized in all types of programs like UG, PG, Ph.D and others.' 
    },
    { 
      name: 'Hyderabad University', 
      location: 'Bangalore', 
      established: 2010, 
      contact: '+91 7643335566',
      whatsapp: '+91 7643335566', 
      courses: [{ name: 'BBA', duration: '2 years' }], 
      rating: 5, 
      placementPercentage: 45, 
      image: 'Hyderabad.png', 
      campusSize: '120 acres',
      history: 'In Kolkata, there are 25 universities. Out of which 17 are government and the rest 8 are privately held. Some of the best universities are Jadavpur University, WBSU, Calcutta University, UEM, etc. The lowest fee offered by the best university is 1.80k. The highest offered fee is 28.3lakh. University fees depend upon the courses and universities. These universities specialized in all types of programs like UG, PG, Ph.D and others.'
    }
  ];

  try {
    await University.insertMany(dummyUniversities);
    console.log('Dummy universities inserted successfully');
  } catch (err) {
    console.error('Error inserting dummy universities:', err);
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
  const { username, email, password, phone} = req.body;
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword, phone });
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
