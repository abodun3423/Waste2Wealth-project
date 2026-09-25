const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Redemption = require('../models/Redemption');
const auth = require('../middleware/auth');

const allowedRewards = {
  airtime500: {
    name: '₦500 Airtime',
    points: 500
  },

  data1gb: {
    name: '1GB Data',
    points: 1000
  },

  reusableBag: {
    name: 'Reusable Shopping Bag',
    points: 1500
  },

  recyclingBin: {
    name: 'Recycling Bin',
    points: 2500
  },

  solarLamp: {
    name: 'Solar Rechargeable Lamp',
    points: 7500
  }
};


// ======================================
// REDEEM A REWARD
// ======================================
router.post('/', auth, async (req, res) => {
  try {
    const { rewardId } = req.body;

    const reward = allowedRewards[rewardId];

    if (!reward) {
      return res.status(400).json({
        error: 'Invalid reward'
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const currentPoints = user.points || 0;

    if (currentPoints < reward.points) {
      return res.status(400).json({
        error: 'Not enough points'
      });
    }

    user.points = currentPoints - reward.points;

    await user.save();

    const redemption = new Redemption({
      user: req.userId,
      rewardName: reward.name,
      pointsSpent: reward.points,
      status: 'pending'
    });

    await redemption.save();

    res.status(201).json({
      message: 'Reward redeemed successfully',
      redemption,
      remainingPoints: user.points
    });

  } catch (err) {
    console.error('Redemption error:', err);

    res.status(500).json({
      error: 'Server error'
    });
  }
});


// ======================================
// GET USER REDEMPTION HISTORY
// ======================================
router.get('/', auth, async (req, res) => {
  try {
    const redemptions = await Redemption.find({
      user: req.userId
    }).sort({ createdAt: -1 });

    res.json(redemptions);

  } catch (err) {
    console.error('Redemption history error:', err);

    res.status(500).json({
      error: 'Server error'
    });
  }
});

module.exports = router;
