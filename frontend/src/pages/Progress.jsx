import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Award, Target, TrendingUp } from 'lucide-react';

const formatActivity = (activityType) => {
    switch (activityType) {
        case 'content_generated':
            return 'Generated Content';
        case 'exercise_completed':
            return 'Completed Exercise';
        case 'login':
            return 'Logged In';
        case 'profile_update':
            return 'Updated Profile';
        default:
            return activityType;
    }
};

const Progress = () => {
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [goalTarget, setGoalTarget] = useState('');
    const [shareMessage, setShareMessage] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [summaryRes, historyRes] = await Promise.all([
                axios.get('/api/progress/summary', config),
                axios.get('/api/progress/history', config)
            ]);

            if (summaryRes.data.success) {
                setSummary(summaryRes.data.data);
                setGoalTarget(summaryRes.data.data.weeklyGoal?.target ?? '');
            }
            if (historyRes.data.success) {
                setHistory(historyRes.data.data);
            }
        } catch (err) {
            setError('Failed to load progress data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGoalSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.put('/api/progress/weekly-goal', { target: Number(goalTarget) }, config);
            if (data.success) {
                setMessage('Weekly goal updated!');
                setSummary((prev) => ({ ...prev, weeklyGoal: data.data }));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update weekly goal');
        }
    };

    const handleShareProgress = async () => {
        setShareMessage('');
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = {
                type: 'progress',
                data: {
                    points,
                    streak,
                    badges,
                    weeklyGoal
                }
            };
            const { data } = await axios.post('/api/shares', payload, config);
            if (data.success) {
                setShareMessage('Progress shared to community.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to share progress');
        }
    };

    const points = summary?.gamification?.points || 0;
    const streak = summary?.gamification?.streak || 0;
    const badges = summary?.gamification?.badges || [];
    const stats = summary?.stats || {};
    const weeklyGoal = summary?.weeklyGoal || { target: 0, progress: 0 };
    const weeklyProgress = weeklyGoal.target
        ? Math.min((weeklyGoal.progress / weeklyGoal.target) * 100, 100)
        : 0;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Progress</h1>
                <p className="text-gray-600">Track your goals, streaks, and achievements.</p>
            </div>

            {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{message}</div>}
            {shareMessage && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{shareMessage}</div>}
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-semibold">Overall Stats</span>
                    </div>
                    <div className="text-sm text-gray-500">Points: <span className="font-semibold text-gray-800">{points}</span></div>
                    <div className="text-sm text-gray-500">Streak: <span className="font-semibold text-gray-800">{streak} days</span></div>
                    <div className="text-sm text-gray-500">Content Generated: <span className="font-semibold text-gray-800">{stats.generatedCount || 0}</span></div>
                    <div className="text-sm text-gray-500">Exercises Completed: <span className="font-semibold text-gray-800">{stats.completedExercises || 0}</span></div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <Target className="h-5 w-5" />
                        <span className="font-semibold">Weekly Goal</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800">{weeklyGoal.progress} / {weeklyGoal.target}</div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${weeklyProgress}%` }} />
                    </div>
                    <form onSubmit={handleGoalSubmit} className="mt-4 flex items-center space-x-2">
                        <input
                            type="number"
                            min="0"
                            value={goalTarget}
                            onChange={(e) => setGoalTarget(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Set weekly goal"
                            required
                        />
                        <button type="submit" className="btn-primary whitespace-nowrap">Save</button>
                    </form>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <Award className="h-5 w-5" />
                        <span className="font-semibold">Badges</span>
                    </div>
                    {badges.length === 0 && <div className="text-sm text-gray-500">No badges yet.</div>}
                    <div className="flex flex-wrap gap-2">
                        {badges.map((badge) => (
                            <span key={badge} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
                                {badge}
                            </span>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={handleShareProgress}
                        className="mt-4 btn-primary"
                    >
                        Share Progress
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                {history.length === 0 && <div className="text-sm text-gray-500">No activity yet.</div>}
                <div className="space-y-3">
                    {history.map((item) => (
                        <div key={item._id} className="flex items-center justify-between text-sm text-gray-600">
                            <span>{formatActivity(item.activityType)}</span>
                            <span className="text-gray-400">{new Date(item.createdAt).toLocaleString()}</span>
                            <span className="font-semibold text-gray-800">+{item.pointsAwarded}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Progress;
