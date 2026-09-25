const mongoose = require('mongoose');

const PickupRequestSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecyclingCompany',
    required: true
  },

  material: {
    type: String,
    required: true
  },

  estimatedWeight: {
    type: Number,
    required: true,
    min: 0.1
  },

  verifiedWeight: {
    type: Number,
    default: null
  },

  pickupAddress: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  preferredDate: {
    type: Date,
    required: true
  },

  notes: {
    type: String,
    default: ''
  },

  status: {
    type: String,
    enum: [
      'pending',
      'accepted',
      'collected',
      'completed',
      'cancelled'
    ],
    default: 'pending'
  },

  pointsAwarded: {
    type: Number,
    default: 0
  },

  pointsProcessed: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model(
  'PickupRequest',
  PickupRequestSchema
);
