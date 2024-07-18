const express = require('express');
const router = express.Router();
const Comparison = require('../models/Comparison');

router.get('/', async (req, res) => {
  const comparisons = await Comparison.find().populate('universities programs');
  res.json(comparisons);
});

router.post('/', async (req, res) => {
  const comparison = new Comparison(req.body);
  await comparison.save();
  res.status(201).json(comparison);
});

module.exports = router;
