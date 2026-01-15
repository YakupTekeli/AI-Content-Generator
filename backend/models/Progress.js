const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activityType: {
        type: String,
        enum: ['content_generated', 'exercise_completed', 'login', 'profile_update'],
        required: true
    },
    pointsAwarded: {
        type: Number,
        default: 0
    },
    metadata: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Progress', ProgressSchema);
