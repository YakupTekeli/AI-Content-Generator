const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active'
    },
    interests: {
        type: [String],
        default: []
    },
    languageLevel: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Not Selected'],
        default: 'Not Selected'
    },
    gamification: {
        points: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        lastActivityDate: { type: Date },
        badges: { type: [String], default: [] }
    },
    weeklyGoal: {
        target: { type: Number, default: 0 }, // e.g., number of words or exercises
        progress: { type: Number, default: 0 },
        startDate: { type: Date }
    },
    stats: {
        generatedCount: { type: Number, default: 0 },
        completedExercises: { type: Number, default: 0 },
        totalActivities: { type: Number, default: 0 },
        lastGeneratedAt: { type: Date },
        lastExerciseAt: { type: Date }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    resetKey: {
        type: String,
        unique: true,
        sparse: true
    },
    resetKeyCreatedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
