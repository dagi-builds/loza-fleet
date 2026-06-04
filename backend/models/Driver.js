const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  plate: { type: String, required: true },
  pin: { type: String, default: '' },
  phone: { type: String, default: '' },
  trips: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  fuel: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);