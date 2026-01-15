const User = require('../models/User');
const Progress = require('../models/Progress');
const GamificationSettings = require('../models/GamificationSettings');
const { updateStreak, updateWeeklyGoal, applyBadges } = require('../utils/gamification');

const DEFAULT_POINTS = {
    content_generated: 10,
    exercise_completed: 5,
    login: 1,
    profile_update: 1
};

const recordActivity = async (userId, { type, metadata = {}, count = 1 }) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const now = new Date();
    const settings = await GamificationSettings.findOne();
    const pointsMap = settings?.points || DEFAULT_POINTS;
    const points = (pointsMap[type] || 0) * count;

    user.gamification = user.gamification || { points: 0, streak: 0, badges: [] };
    user.gamification.points = user.gamification.points || 0;
    user.gamification.streak = user.gamification.streak || 0;
    user.gamification.badges = user.gamification.badges || [];
    user.stats = user.stats || {};
    user.weeklyGoal = user.weeklyGoal || { target: 0, progress: 0 };

    user.gamification.points += points;

    const streakResult = updateStreak(user.gamification.lastActivityDate, user.gamification.streak, now);
    if (streakResult.incremented) {
        user.gamification.streak = streakResult.streak;
    }
    user.gamification.lastActivityDate = now;

    updateWeeklyGoal(user.weeklyGoal, count, now);

    user.stats.totalActivities = (user.stats.totalActivities || 0) + count;
    if (type === 'content_generated') {
        user.stats.generatedCount = (user.stats.generatedCount || 0) + count;
        user.stats.lastGeneratedAt = now;
    }
    if (type === 'exercise_completed') {
        user.stats.completedExercises = (user.stats.completedExercises || 0) + count;
        user.stats.lastExerciseAt = now;
    }

    applyBadges(user, settings?.badges);

    await user.save();

    const progress = await Progress.create({
        user: user._id,
        activityType: type,
        pointsAwarded: points,
        metadata,
        createdAt: now
    });

    return { user, progress };
};

module.exports = {
    recordActivity
};
