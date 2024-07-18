const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/college-vidya', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
})
.then(() => {
    console.log('MongoDB connected');
    insertDummyUniversities(); // Call function to insert dummy universities after successful connection
})
.catch((err) => console.error('MongoDB connection error:', err));

// Schema and Model setup
const universitySchema = new mongoose.Schema({
    name: String,
    location: String,
    established: Number
});

const University = mongoose.model('University', universitySchema);

// Function to insert dummy universities
async function insertDummyUniversities() {
    const dummyUniversities = [
        { name: 'Dummy University 1', location: 'Dummy Location 1', established: 2023 },
        { name: 'Dummy University 2', location: 'Dummy Location 2', established: 2022 },
        { name: 'Dummy University 3', location: 'Dummy Location 3', established: 2021 }
    ];

    try {
        await University.insertMany(dummyUniversities);
        console.log('Dummy universities inserted successfully');
    } catch (err) {
        console.error('Error inserting dummy universities:', err);
    }
}

// Route to insert a new university
app.post('/api/universities', async (req, res) => {
    const { name, location, established } = req.body;
    const newUniversity = new University({ name, location, established });

    try {
        await newUniversity.save();
        res.status(201).json({ message: 'University inserted successfully' });
    } catch (err) {
        console.error('Error inserting university:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
