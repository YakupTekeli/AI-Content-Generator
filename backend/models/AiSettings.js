const mongoose = require('mongoose');

const AiSettingsSchema = new mongoose.Schema({
    restrictedTopics: {
        type: [String],
        default: []
    },
    safetyMode: {
        type: String,
        enum: ['standard', 'strict'],
        default: 'standard'
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

module.exports = mongoose.model('AiSettings', AiSettingsSchema);
