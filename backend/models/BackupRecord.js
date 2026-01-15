const mongoose = require('mongoose');

const BackupRecordSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        default: 0
    },
    collections: {
        type: [String],
        default: []
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

module.exports = mongoose.model('BackupRecord', BackupRecordSchema);
