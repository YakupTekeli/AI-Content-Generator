const Notification = require('../models/Notification');

// @desc    Get active notifications
// @route   GET /api/notifications
// @access  Private
exports.getActiveNotifications = async (req, res) => {
    try {
        const now = new Date();
        const notifications = await Notification.find({
            active: true,
            $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
