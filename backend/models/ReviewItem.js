const mongoose = require('mongoose');

const ReviewItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    word: {
        type: String,
        required: true
    },
    context: {
        type: String,
        default: ''
    },
    sourceContent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    },
    timesMissed: {
        type: Number,
        default: 1
    },
    lastMissedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ReviewItemSchema.index({ user: 1, word: 1 }, { unique: true });

module.exports = mongoose.model('ReviewItem', ReviewItemSchema);
