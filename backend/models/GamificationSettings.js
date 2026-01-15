const mongoose = require('mongoose');

const GamificationSettingsSchema = new mongoose.Schema({
    points: {
        content_generated: { type: Number, default: 10 },
        exercise_completed: { type: Number, default: 5 },
        login: { type: Number, default: 1 },
        profile_update: { type: Number, default: 1 }
    },
    badges: {
        content_count: { type: Number, default: 10 },
        exercise_count: { type: Number, default: 5 },
        streak_3: { type: Number, default: 3 },
        streak_7: { type: Number, default: 7 },
        points_100: { type: Number, default: 100 }
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GamificationSettings', GamificationSettingsSchema);
