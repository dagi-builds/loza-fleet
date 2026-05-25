const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  profit:   { type: Number, default: 800 },
  bonus:    { type: Number, default: 50 },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);