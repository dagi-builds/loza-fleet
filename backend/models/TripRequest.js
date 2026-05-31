const mongoose = require('mongoose');

const tripRequestSchema = new mongoose.Schema({
    driverId: { type: String, required: true },
    driverName: { type: String, required: true },
    plate: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    note: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('TripRequest', tripRequestSchema);