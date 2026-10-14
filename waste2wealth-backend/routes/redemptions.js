const express = require('express');
const mongoose = require('mongoose');
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

    const session = await mongoose.startSession();
    try {
      const result = await session.withTransaction(async () => {
        const user = await User.findOneAndUpdate(
          { _id: req.userId, points: { $gte: reward.points } },
          { $inc: { points: -reward.points } },
          { new: true, session }
        );
        if (!user) {
          const exists = await User.exists({ _id: req.userId }).session(session);
          const err = new Error(exists ? 'Not enough points' : 'User not found');
          err.status = exists ? 400 : 404;
          throw err;
        }
        const [redemption] = await Redemption.create([{
          user: req.userId,
          rewardName: reward.name,
          pointsSpent: reward.points,
          status: 'pending'
        }], { session });
        return { redemption, remainingPoints: user.points };
      });
      return res.status(201).json({ message: 'Reward redeemed successfully', ...result });
    } finally {
      await session.endSession();
    }

  } catch (err) {
    console.error('Redemption error:', err);
    if (err.status) return res.status(err.status).json({ error: err.message });

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
