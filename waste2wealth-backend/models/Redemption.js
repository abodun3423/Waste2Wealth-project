const mongoose = require('mongoose');

const RedemptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  rewardName: {
    type: String,
    required: true
  },

  pointsSpent: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }

}, { timestamps: true });

module.exports = mongoose.model('Redemption', RedemptionSchema);
