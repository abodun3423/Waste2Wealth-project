const mongoose = require('mongoose');

const RecyclableSchema = new mongoose.Schema({
  type: { type: String, required: true },
  weight: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Recyclable', RecyclableSchema);
