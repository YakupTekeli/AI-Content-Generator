const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    },
    type: {
        type: String,
        enum: ['content', 'progress', 'badge'],
        default: 'content'
    },
    data: {
        type: Object,
        default: {}
    },
    visibility: {
        type: String,
        enum: ['public'],
        default: 'public'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Share', ShareSchema);
