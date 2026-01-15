import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Flame, Star, Book, ArrowRight, Target } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [summaryError, setSummaryError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/progress/summary', config);
                if (data.success) {
                    setSummary(data.data);
                }
            } catch (error) {
                setSummaryError('Failed to load progress summary');
            }
        };

        fetchSummary();
    }, []);

    const points = summary?.gamification?.points ?? user.gamification?.points ?? 0;
    const streak = summary?.gamification?.streak ?? user.gamification?.streak ?? 0;
    const generatedCount = summary?.stats?.generatedCount ?? 0;
    const weeklyGoal = summary?.weeklyGoal;
    const weeklyProgress = weeklyGoal?.target ? Math.min((weeklyGoal.progress / weeklyGoal.target) * 100, 100) : 0;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Welcome back, <span className="text-indigo-600">{user.name}</span>!</h1>
            {summaryError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{summaryError}</div>}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center space-x-3 mb-2">
                        <Star className="h-6 w-6 text-yellow-300" />
                        <span className="font-semibold opacity-90">Total Points</span>
                    </div>
                    <div className="text-4xl font-bold">{points}</div>
                </div>

                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center space-x-3 mb-2">
                        <Flame className="h-6 w-6 text-yellow-200" />
                        <span className="font-semibold opacity-90">Daily Streak</span>
                    </div>
                    <div className="text-4xl font-bold">{streak} Days</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex flex-col justify-center items-start">
                    <h3 className="font-semibold text-gray-500 mb-1">Current Level</h3>
                    <div className="text-3xl font-bold text-gray-800">{user.languageLevel}</div>
                    <Link to="/profile" className="text-indigo-600 text-sm mt-2 hover:underline">Update Level</Link>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex flex-col justify-center items-start">
                    <div className="flex items-center space-x-2 text-gray-500 mb-2">
                        <Target className="h-5 w-5" />
                        <span className="font-semibold">Weekly Goal</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                        {weeklyGoal?.progress || 0} / {weeklyGoal?.target || 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Generated: {generatedCount}</div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                        <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${weeklyProgress}%` }}
                        />
                    </div>
                    <Link to="/progress" className="text-indigo-600 text-sm mt-2 hover:underline">View Progress</Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/generate" className="card flex items-center justify-between group cursor-pointer hover:border-indigo-500 border border-transparent">
                        <div className="flex items-center space-x-4">
                            <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-600 transition-colors">
                                <Book className="h-6 w-6 text-indigo-600 group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Generate New Content</h3>
                                <p className="text-sm text-gray-500">Create a story or article based on your interests</p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>

                    <Link to="/progress" className="card flex items-center justify-between group cursor-pointer hover:border-indigo-500 border border-transparent">
                        <div className="flex items-center space-x-4">
                            <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-600 transition-colors">
                                <Target className="h-6 w-6 text-purple-600 group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Weekly Progress</h3>
                                <p className="text-sm text-gray-500">Track goals and badges</p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>

                    <Link to="/history" className="card flex items-center justify-between group cursor-pointer hover:border-indigo-500 border border-transparent">
                        <div className="flex items-center space-x-4">
                            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-600 transition-colors">
                                <Star className="h-6 w-6 text-green-600 group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Review History</h3>
                                <p className="text-sm text-gray-500">Access your past readings and exercises</p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
