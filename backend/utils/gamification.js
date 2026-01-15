const getWeekStart = (date = new Date()) => {
    const start = new Date(date);
    const day = start.getDay(); // 0 = Sunday
    const diff = (day + 6) % 7; // Monday as start of week
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
};

const isSameDay = (a, b) => {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
};

const updateStreak = (lastActivityDate, currentStreak, now = new Date()) => {
    if (!lastActivityDate) {
        return { streak: 1, incremented: true };
    }

    const last = new Date(lastActivityDate);
    if (isSameDay(last, now)) {
        return { streak: currentStreak, incremented: false };
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (isSameDay(last, yesterday)) {
        return { streak: currentStreak + 1, incremented: true };
    }

    return { streak: 1, incremented: true };
};

const updateWeeklyGoal = (weeklyGoal, increment, now = new Date()) => {
    if (!weeklyGoal) return;
    const weekStart = getWeekStart(now);
    if (!weeklyGoal.startDate || weeklyGoal.startDate < weekStart) {
        weeklyGoal.startDate = weekStart;
        weeklyGoal.progress = 0;
    }
    if (weeklyGoal.target > 0) {
        weeklyGoal.progress += increment;
    }
};

const getBadgeSettings = (settings = {}) => {
    const badgeDefaults = {
        content_count: 10,
        exercise_count: 5,
        streak_3: 3,
        streak_7: 7,
        points_100: 100
    };

    return {
        content_count: settings.content_count ?? badgeDefaults.content_count,
        exercise_count: settings.exercise_count ?? badgeDefaults.exercise_count,
        streak_3: settings.streak_3 ?? badgeDefaults.streak_3,
        streak_7: settings.streak_7 ?? badgeDefaults.streak_7,
        points_100: settings.points_100 ?? badgeDefaults.points_100
    };
};

const applyBadges = (user, settings) => {
    const badges = new Set(user.gamification?.badges || []);
    const points = user.gamification?.points || 0;
    const streak = user.gamification?.streak || 0;
    const generated = user.stats?.generatedCount || 0;
    const exercises = user.stats?.completedExercises || 0;
    const weekly = user.weeklyGoal;
    const badgeSettings = getBadgeSettings(settings);

    const rules = [
        { id: 'first-content', label: 'First Content', condition: generated >= 1 },
        { id: 'content-10', label: 'Content Explorer', condition: generated >= badgeSettings.content_count },
        { id: 'exercise-5', label: 'Exercise Starter', condition: exercises >= badgeSettings.exercise_count },
        { id: 'streak-3', label: '3-Day Streak', condition: streak >= badgeSettings.streak_3 },
        { id: 'streak-7', label: '7-Day Streak', condition: streak >= badgeSettings.streak_7 },
        { id: 'points-100', label: '100 Points', condition: points >= badgeSettings.points_100 },
        {
            id: 'weekly-goal',
            label: 'Weekly Goal Achiever',
            condition: weekly && weekly.target > 0 && weekly.progress >= weekly.target
        }
    ];

    rules.forEach((rule) => {
        if (rule.condition) {
            badges.add(rule.label);
        }
    });

    user.gamification.badges = Array.from(badges);
};

module.exports = {
    updateStreak,
    updateWeeklyGoal,
    applyBadges,
    getWeekStart
};
