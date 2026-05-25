const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  amount:   { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('FuelLog', fuelLogSchema);