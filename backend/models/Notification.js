const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
