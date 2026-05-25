const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: { type: String, default: 'owner' },
    password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AdminUser', adminSchema);