const express = require('express');
const router = express.Router();

const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      'name email points'
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      name: user.name,
      email: user.email,
      points: user.points || 0
    });

  } catch (err) {
    console.error('Rewards error:', err);

    res.status(500).json({
      error: 'Server error'
    });
  }
});

module.exports = router;
