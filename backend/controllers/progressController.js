const Progress = require('../models/Progress');
const User = require('../models/User');
const progressService = require('../services/progressService');
const { getWeekStart } = require('../utils/gamification');

// @desc    Get progress summary
// @route   GET /api/progress/summary
// @access  Private
exports.getSummary = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                gamification: user.gamification,
                weeklyGoal: user.weeklyGoal,
                stats: user.stats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get recent progress history
// @route   GET /api/progress/history
// @access  Private
exports.getHistory = async (req, res) => {
    try {
        const history = await Progress.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update weekly goal target
// @route   PUT /api/progress/weekly-goal
// @access  Private
exports.updateWeeklyGoal = async (req, res) => {
    const { target } = req.body;

    if (target === undefined || Number.isNaN(Number(target)) || Number(target) < 0) {
        return res.status(400).json({ success: false, message: 'Target must be a number >= 0' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.weeklyGoal = user.weeklyGoal || { target: 0, progress: 0 };
        user.weeklyGoal.target = Number(target);
        user.weeklyGoal.progress = 0;
        user.weeklyGoal.startDate = getWeekStart(new Date());

        await user.save();

        res.status(200).json({
            success: true,
            data: user.weeklyGoal
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Record exercise completion (manual trigger for now)
// @route   POST /api/progress/exercise
// @access  Private
exports.recordExercise = async (req, res) => {
    const { count } = req.body;
    const increment = count && Number(count) > 0 ? Number(count) : 1;

    try {
        const result = await progressService.recordActivity(req.user.id, {
            type: 'exercise_completed',
            count: increment
        });

        res.status(200).json({
            success: true,
            data: {
                gamification: result.user.gamification,
                weeklyGoal: result.user.weeklyGoal,
                stats: result.user.stats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
