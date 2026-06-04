const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    driverId: { type: String, required: true },
    driverName: { type: String, required: true },
    plate: { type: String, required: true },
    type: { type: String, enum: ['fuel', 'repair', 'other'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    phone: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    ownerNote: { type: String, default: '' },
    paidViaChapa: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);