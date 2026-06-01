const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    permissions: {
        viewFleet: { type: Boolean, default: true },
        viewActivity: { type: Boolean, default: true },
        viewRequests: { type: Boolean, default: true },
        approveRequests: { type: Boolean, default: true },
        approveTrips: { type: Boolean, default: true },
        addDrivers: { type: Boolean, default: false },
        viewCharts: { type: Boolean, default: true },
    }
}, { timestamps: true });

module.exports = mongoose.model('Manager', managerSchema);