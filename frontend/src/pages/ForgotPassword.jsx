import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [resetKey, setResetKey] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('email');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/auth/forgotpassword', { email });
            if (data.success) {
                setMessage('Email verified. Enter your reset key to continue.');
                setStep('key');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify email');
        } finally {
            setLoading(false);
        }
    };

    const handleKeySubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/auth/verify-reset-key', {
                email,
                resetKey
            });
            if (data.success) {
                navigate(`/reset-password/${resetKey.trim()}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify reset key');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('email');
        setResetKey('');
        setMessage('');
        setError('');
    };

    return (
        <div className="flex justify-center items-center h-[80vh]">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Forgot Password</h2>
                {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</div>}
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                {step === 'email' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full btn-primary mt-4" disabled={loading}>
                            {loading ? 'Checking...' : 'Continue'}
                        </button>
                    </form>
                )}
                {step === 'key' && (
                    <form onSubmit={handleKeySubmit} className="space-y-4">
                        <div className="text-sm text-gray-600">
                            Enter the reset key you saved when you created your account.
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                readOnly
                                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Reset Key</label>
                            <input
                                type="text"
                                value={resetKey}
                                onChange={(e) => setResetKey(e.target.value.toUpperCase())}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <button type="submit" className="w-full btn-primary mt-4" disabled={loading}>
                                {loading ? 'Verifying...' : 'Continue to Reset'}
                            </button>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-full mt-4 border border-gray-200 rounded-lg py-2 text-gray-600 hover:bg-gray-50"
                            >
                                Back
                            </button>
                        </div>
                    </form>
                )}
                <p className="mt-4 text-center text-sm text-gray-600">
                    Back to <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
