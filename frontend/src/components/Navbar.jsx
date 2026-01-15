import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Menu, X, LogOut, Zap } from 'lucide-react'; // Example icons

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) {
                setNotifications([]);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/notifications', config);
                if (data.success) {
                    setNotifications(data.data);
                }
            } catch (error) {
                setNotifications([]);
            }
        };

        fetchNotifications();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="sticky top-0 z-50">
            {user && notifications.length > 0 && (
                <div className="bg-indigo-600 text-white text-sm py-2">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {notifications[0].message}
                    </div>
                </div>
            )}
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to={user ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center">
                                <Zap className="h-8 w-8 text-indigo-600" />
                                <span className="ml-2 font-bold text-xl text-gray-800 tracking-tight">AI Learner</span>
                            </Link>
                        </div>

                    {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <>
                                    <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                                    <Link to="/generate" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Generate</Link>
                                    <Link to="/history" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">History</Link>
                                    <Link to="/progress" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Progress</Link>
                                    <Link to="/community" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Community</Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Admin</Link>
                                    )}
                                    <Link to="/profile" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Profile</Link>
                                    <button onClick={handleLogout} className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg ml-4 transition-colors">
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
                                    <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">Get Started</Link>
                                </>
                            )}
                        </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900 focus:outline-none">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {user ? (
                                <>
                                    <Link to="/dashboard" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
                                    <Link to="/generate" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Generate</Link>
                                    <Link to="/history" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">History</Link>
                                    <Link to="/progress" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Progress</Link>
                                    <Link to="/community" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Community</Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Admin</Link>
                                    )}
                                    <Link to="/profile" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Profile</Link>
                                    <button onClick={handleLogout} className="w-full text-left text-red-600 px-3 py-2 rounded-md text-base font-medium">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Login</Link>
                                    <Link to="/register" className="block bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-base font-medium mt-2">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Navbar;
