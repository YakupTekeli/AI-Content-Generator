const Share = require('../models/Share');
const Content = require('../models/Content');

// @desc    Create a share
// @route   POST /api/shares
// @access  Private
exports.createShare = async (req, res) => {
    const { contentId, type, data } = req.body;

    try {
        let content = null;
        if (contentId) {
            content = await Content.findById(contentId);
            if (!content) {
                return res.status(404).json({ success: false, message: 'Content not found' });
            }
            if (content.user.toString() !== req.user.id) {
                return res.status(401).json({ success: false, message: 'Not authorized' });
            }
        }

        const share = await Share.create({
            user: req.user.id,
            content: content ? content._id : undefined,
            type: type || (content ? 'content' : 'progress'),
            data: data || {},
            visibility: 'public'
        });

        res.status(201).json({ success: true, data: share });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    List public shares
// @route   GET /api/shares
// @access  Public
exports.getPublicShares = async (req, res) => {
    try {
        const shares = await Share.find({ visibility: 'public' })
            .sort({ createdAt: -1 })
            .populate('user', 'name')
            .populate('content', 'title type level');

        res.status(200).json({ success: true, data: shares });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    List user's shares
// @route   GET /api/shares/mine
// @access  Private
exports.getMyShares = async (req, res) => {
    try {
        const shares = await Share.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('content', 'title type level');

        res.status(200).json({ success: true, data: shares });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
