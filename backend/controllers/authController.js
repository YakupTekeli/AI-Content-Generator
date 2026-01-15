const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateResetKey = () => crypto.randomBytes(4).toString('hex').toUpperCase();

const createUniqueResetKey = async () => {
    let resetKey;
    let exists = true;
    while (exists) {
        resetKey = generateResetKey();
        exists = await User.exists({ resetKey });
    }
    return resetKey;
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const adminExists = await User.exists({ role: 'admin' });
        const resetKey = await createUniqueResetKey();
        const user = await User.create({
            name,
            email,
            password,
            role: adminExists ? 'student' : 'admin',
            resetKey,
            resetKeyCreatedAt: new Date()
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                resetKey: user.resetKey,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            if (user.status === 'suspended') {
                return res.status(403).json({ success: false, message: 'Account is suspended' });
            }
            res.json({
                success: true,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                interests: user.interests,
                languageLevel: user.languageLevel,
                resetKey: user.resetKey,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email,
            interests: req.body.interests,
            languageLevel: req.body.languageLevel
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Email not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Email verified. Please enter your reset key.'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Verify reset key
// @route   POST /api/auth/verify-reset-key
// @access  Public
exports.verifyResetKey = async (req, res) => {
    const { email, resetKey } = req.body;

    if (!email || !resetKey) {
        return res.status(400).json({ success: false, message: 'Email and reset key are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }

        if (!user.resetKey || user.resetKey !== String(resetKey).trim().toUpperCase()) {
            return res.status(400).json({ success: false, message: 'Invalid reset key' });
        }

        return res.status(200).json({ success: true, message: 'Reset key verified' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reset password
// @route   POST /api/auth/resetpassword/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
    const { resetToken } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Password is required' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (!resetToken) {
        return res.status(400).json({ success: false, message: 'Reset key is required' });
    }

    try {
        const user = await User.findOne({ resetKey: String(resetToken).trim().toUpperCase() });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid reset key' });
        }

        user.password = password;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};
