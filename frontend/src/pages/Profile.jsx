import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Copy, Save } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth(); // Note: user context might be stale after update if not refreshed
    // In a real app we'd trigger a reload of user context. 
    // For this MVP, we assume local state update is enough for UI feedback.

    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        interests: user.interests ? user.interests.join(', ') : '',
        languageLevel: user.languageLevel
    });
    const [message, setMessage] = useState('');
    const [copyMessage, setCopyMessage] = useState('');
    const alertKey = user?._id ? `resetKeyAlert:${user._id}` : 'resetKeyAlert';
    const [showResetAlert, setShowResetAlert] = useState(false);

    useEffect(() => {
        if (user?.resetKey && localStorage.getItem(alertKey) === 'true') {
            setShowResetAlert(true);
        }
    }, [user, alertKey]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                ...formData,
                interests: formData.interests.split(',').map(i => i.trim()).filter(i => i)
            };

            const { data } = await axios.put('/api/auth/updatedetails', payload, config);
            if (data.success) {
                setMessage('Profile updated successfully! (Refresh to see changes globally)');
            }
        } catch (error) {
            setMessage('Failed to update profile');
        }
    };

    const handleCopy = async () => {
        if (!user?.resetKey) return;
        setCopyMessage('');
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(user.resetKey);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = user.resetKey;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopyMessage('Reset key copied.');
        } catch (error) {
            setCopyMessage('Failed to copy reset key.');
        }
    };

    const dismissResetAlert = () => {
        localStorage.setItem(alertKey, 'dismissed');
        setShowResetAlert(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                {message && <div className={`p-4 rounded-lg mb-6 ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}
                {showResetAlert && (
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6 text-sm flex items-start justify-between">
                        <div>
                            <div className="font-semibold">Save your reset key</div>
                            <div>Keep this key in a safe place. You will need it to reset your password.</div>
                        </div>
                        <button type="button" onClick={dismissResetAlert} className="text-yellow-700 underline text-sm ml-4">
                            I saved it
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                            readOnly
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interests (comma separated)</label>
                        <input
                            type="text"
                            name="interests"
                            value={formData.interests}
                            onChange={handleChange}
                            placeholder="Sports, Music, Science..."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">These topics help customize your content.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Language Level</label>
                        <select
                            name="languageLevel"
                            value={formData.languageLevel}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option>A1</option>
                            <option>A2</option>
                            <option>B1</option>
                            <option>B2</option>
                            <option>C1</option>
                            <option>C2</option>
                            <option>Not Selected</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Reset Key</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={user?.resetKey || ''}
                                readOnly
                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="flex items-center space-x-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg"
                            >
                                <Copy className="h-4 w-4" />
                                <span>Copy</span>
                            </button>
                        </div>
                        {copyMessage && <div className="text-xs text-gray-500 mt-2">{copyMessage}</div>}
                        <p className="text-xs text-gray-500 mt-1">Save this key securely. It is required for password resets.</p>
                    </div>

                    <button type="submit" className="btn-primary w-full flex justify-center items-center space-x-2">
                        <Save className="h-5 w-5" />
                        <span>Save Changes</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
