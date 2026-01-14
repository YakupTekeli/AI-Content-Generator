import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Flame, Star, Book, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ points: 0, streak: 0 });

    // In a real app, I'd fetch fresh stats here, but user context has them initially.
    // Ideally, I should rely on the user object from context being up to date.

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Welcome back, <span className="text-indigo-600">{user.name}</span>!</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center space-x-3 mb-2">
                        <Star className="h-6 w-6 text-yellow-300" />
                        <span className="font-semibold opacity-90">Total Points</span>
                    </div>
                    <div className="text-4xl font-bold">{user.gamification?.points || 0}</div>
                </div>

                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center space-x-3 mb-2">
                        <Flame className="h-6 w-6 text-yellow-200" />
                        <span className="font-semibold opacity-90">Daily Streak</span>
                    </div>
                    <div className="text-4xl font-bold">{user.gamification?.streak || 0} Days</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex flex-col justify-center items-start">
                    <h3 className="font-semibold text-gray-500 mb-1">Current Level</h3>
                    <div className="text-3xl font-bold text-gray-800">{user.languageLevel}</div>
                    <Link to="/profile" className="text-indigo-600 text-sm mt-2 hover:underline">Update Level</Link>
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
