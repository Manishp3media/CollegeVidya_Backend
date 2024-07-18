const express = require('express');
const router = express.Router();
const Program = require('../models/Program');

router.get('/', async (req, res) => {
  const programs = await Program.find().populate('university');
  res.json(programs);
});

router.post('/', async (req, res) => {
  const program = new Program(req.body);
  await program.save();
  res.status(201).json(program);
});

module.exports = router;
