import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Trophy } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center pt-10">
            <div className="text-center max-w-4xl px-4">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
                    Master English with <span className="gradient-text">AI-Powered</span> Lessons
                </h1>
                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                    Generate personalized stories, articles, and exercises tailored to your interests and proficiency level. Learning has never been this engaging.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Link to="/register" className="btn-primary text-lg px-8 py-3">Start Learning Free</Link>
                    <Link to="/login" className="bg-white text-gray-700 hover:bg-gray-50 font-bold py-3 px-8 rounded-lg border border-gray-300 shadow-sm transition-all text-lg">
                        Log In
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-left">
                    <div className="card">
                        <div className="bg-indigo-100 p-3 rounded-full w-fit mb-4">
                            <Sparkles className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Instant Content</h3>
                        <p className="text-gray-600">Create essays, dialogues, and reading comprehensions in seconds based on ANY topic you love.</p>
                    </div>
                    <div className="card">
                        <div className="bg-pink-100 p-3 rounded-full w-fit mb-4">
                            <BookOpen className="h-6 w-6 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Adaptive Levels</h3>
                        <p className="text-gray-600">From A1 to C2, content adjusts to your specific CEFR level to ensure optimal learning.</p>
                    </div>
                    <div className="card">
                        <div className="bg-indigo-100 p-3 rounded-full w-fit mb-4">
                            <Trophy className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Gamified Progress</h3>
                        <p className="text-gray-600">Earn points, maintain streaks, and unlock badges as you complete your daily reading goals.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
