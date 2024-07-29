const express = require('express');
const router = express.Router();
const Expert = require('../models/Expert');

// Get all experts
router.get('/', async (req, res) => {
  try {
    const experts = await Expert.find();
    res.json(experts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new expert
router.post('/', async (req, res) => {
  const expert = new Expert(req.body);
  try {
    const newExpert = await expert.save();
    res.status(201).json(newExpert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
