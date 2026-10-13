const express = require('express');
const router = express.Router();

const Recyclable = require('../models/Recyclable');
const User = require('../models/User');
const auth = require('../middleware/auth');


// ======================================
// UPLOAD RECYCLABLE
// ======================================
router.post('/', auth, async (req, res) => {
  try {
    const { type, weight } = req.body;

    const numericWeight = Number(weight);

    if (!type || !numericWeight || numericWeight <= 0) {
      return res.status(400).json({
        error: 'Valid type and weight are required'
      });
    }

    const recyclable = new Recyclable({
      type,
      weight: numericWeight,
      user: req.userId
    });

    await recyclable.save();

    // Uploaded weight is user-reported and must not generate rewards.
    // Points are awarded only after an approved company verifies a collected pickup.
    res.status(201).json({
      message: 'Recyclable uploaded. Points are awarded only after verified company collection.',
      recyclable,
      pointsEarned: 0
    });

  } catch (err) {
    console.error('Upload recyclable error:', err);

    res.status(500).json({
      error: 'Server error'
    });
  }
});


// ======================================
// GET LOGGED-IN USER'S RECYCLABLES
// ======================================
router.get('/', auth, async (req, res) => {
  try {
    const recyclables = await Recyclable.find({
      user: req.userId
    }).sort({ createdAt: -1 });

    res.json(recyclables);

  } catch (err) {
    console.error('Get recyclables error:', err);

    res.status(500).json({
      error: 'Server error'
    });
  }
});


module.exports = router;
