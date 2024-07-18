const express = require('express');
const router = express.Router();
const University = require('../models/University');

router.get('/', async (req, res) => {
  const universities = await University.find().populate('programs');
  res.json(universities);
});

router.post('/', async (req, res) => {
  const university = new University(req.body);
  await university.save();
  res.status(201).json(university);
});

module.exports = router;
