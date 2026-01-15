import React, { useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const ResetPassword = () => {
    const { token } = useParams();
    const [resetKey, setResetKey] = useState(token || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        if (!resetKey.trim()) {
            setError('Reset key is required');
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.post(`/api/auth/resetpassword/${resetKey.trim()}`, {
                password,
                confirmPassword
            });
            if (data.success) {
                setMessage('Password reset successful. You can log in now.');
                setPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-[80vh]">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>
                {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</div>}
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password Reset Key</label>
                        <input
                            type="text"
                            value={resetKey}
                            onChange={(e) => setResetKey(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your saved reset key"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full btn-primary mt-4" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Back to <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
