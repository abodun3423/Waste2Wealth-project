const mongoose = require('mongoose');

const RecyclingCompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  address: {
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

  latitude: {
    type: Number,
    default: null
  },

  longitude: {
    type: Number,
    default: null
  },

  materialsAccepted: {
    type: [String],
    default: []
  },

  pickupAvailable: {
    type: Boolean,
    default: true
  },

  verified: {
  type: Boolean,
  default: false
},

password: {
  type: String,
  default: null
},

accountActive: {
  type: Boolean,
  default: true
}

}, { timestamps: true });

module.exports = mongoose.model(
  'RecyclingCompany',
  RecyclingCompanySchema
);