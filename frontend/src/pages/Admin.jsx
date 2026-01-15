import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [aiSettings, setAiSettings] = useState({ restrictedTopics: '', safetyMode: 'standard' });
    const [gamificationSettings, setGamificationSettings] = useState(null);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcasts, setBroadcasts] = useState([]);
    const [backups, setBackups] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const authConfig = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchAdminData = async () => {
        try {
            setError('');
            const [usersRes, aiRes, gamifyRes, broadcastsRes, backupsRes] = await Promise.all([
                axios.get('/api/admin/users', authConfig()),
                axios.get('/api/admin/ai-settings', authConfig()),
                axios.get('/api/admin/gamification-settings', authConfig()),
                axios.get('/api/admin/broadcasts', authConfig()),
                axios.get('/api/admin/backups', authConfig())
            ]);

            if (usersRes.data.success) setUsers(usersRes.data.data);
            if (aiRes.data.success) {
                setAiSettings({
                    restrictedTopics: (aiRes.data.data.restrictedTopics || []).join(', '),
                    safetyMode: aiRes.data.data.safetyMode || 'standard'
                });
            }
            if (gamifyRes.data.success) setGamificationSettings(gamifyRes.data.data);
            if (broadcastsRes.data.success) setBroadcasts(broadcastsRes.data.data);
            if (backupsRes.data.success) setBackups(backupsRes.data.data);
        } catch (err) {
            setError('Failed to load admin data');
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const updateUserStatus = async (userId, status) => {
        setMessage('');
        setError('');
        try {
            await axios.put(`/api/admin/users/${userId}/status`, { status }, authConfig());
            setMessage('User status updated');
            fetchAdminData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user');
        }
    };

    const updateUserRole = async (userId, role) => {
        setMessage('');
        setError('');
        try {
            await axios.put(`/api/admin/users/${userId}/role`, { role }, authConfig());
            setMessage('User role updated');
            fetchAdminData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user role');
        }
    };

    const deleteUser = async (userId) => {
        setMessage('');
        setError('');
        try {
            await axios.delete(`/api/admin/users/${userId}`, authConfig());
            setMessage('User deleted');
            fetchAdminData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const saveAiSettings = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const payload = {
                restrictedTopics: aiSettings.restrictedTopics,
                safetyMode: aiSettings.safetyMode
            };
            const { data } = await axios.put('/api/admin/ai-settings', payload, authConfig());
            if (data.success) {
                setMessage('AI settings updated');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update AI settings');
        }
    };

    const saveGamificationSettings = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const payload = {
                points: gamificationSettings.points,
                badges: gamificationSettings.badges
            };
            const { data } = await axios.put('/api/admin/gamification-settings', payload, authConfig());
            if (data.success) {
                setMessage('Gamification settings updated');
                setGamificationSettings(data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update gamification settings');
        }
    };

    const sendBroadcast = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const { data } = await axios.post('/api/admin/broadcasts', { message: broadcastMessage }, authConfig());
            if (data.success) {
                setMessage('Broadcast sent');
                setBroadcastMessage('');
                fetchAdminData();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send broadcast');
        }
    };

    const downloadReport = async (type) => {
        setError('');
        try {
            const response = await axios.get(`/api/admin/reports/${type}`, {
                ...authConfig(),
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${type}-report.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to download report');
        }
    };

    const createBackup = async () => {
        setMessage('');
        setError('');
        try {
            await axios.post('/api/admin/backups', {}, authConfig());
            setMessage('Backup created');
            fetchAdminData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create backup');
        }
    };

    const restoreBackup = async (filename) => {
        setMessage('');
        setError('');
        try {
            await axios.post('/api/admin/backups/restore', { filename }, authConfig());
            setMessage('Backup restored');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to restore backup');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">Manage users, AI settings, gamification, and reports.</p>
            </div>

            {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{message}</div>}
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4">User Management</h2>
                <div className="space-y-3">
                    {users.map((user) => (
                        <div key={user._id} className="flex items-center justify-between border-b pb-3">
                            <div>
                                <div className="font-semibold text-gray-800">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email} • {user.role} • {user.status}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {user.role !== 'admin' ? (
                                    <button onClick={() => updateUserRole(user._id, 'admin')} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded">
                                        Make Admin
                                    </button>
                                ) : (
                                    <button onClick={() => updateUserRole(user._id, 'student')} className="px-3 py-1 bg-gray-100 text-gray-700 rounded">
                                        Make Student
                                    </button>
                                )}
                                {user.status !== 'suspended' ? (
                                    <button onClick={() => updateUserStatus(user._id, 'suspended')} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded">
                                        Suspend
                                    </button>
                                ) : (
                                    <button onClick={() => updateUserStatus(user._id, 'active')} className="px-3 py-1 bg-green-100 text-green-700 rounded">
                                        Reactivate
                                    </button>
                                )}
                                <button onClick={() => deleteUser(user._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form onSubmit={saveAiSettings} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-xl font-bold">AI Settings</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Restricted Topics (comma separated)</label>
                        <input
                            type="text"
                            value={aiSettings.restrictedTopics}
                            onChange={(e) => setAiSettings({ ...aiSettings, restrictedTopics: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Safety Mode</label>
                        <select
                            value={aiSettings.safetyMode}
                            onChange={(e) => setAiSettings({ ...aiSettings, safetyMode: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="standard">Standard</option>
                            <option value="strict">Strict</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary">Save AI Settings</button>
                </form>

                <form onSubmit={saveGamificationSettings} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-xl font-bold">Gamification Settings</h2>
                    {gamificationSettings && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="text-sm text-gray-600">Content Points</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={gamificationSettings.points.content_generated}
                                    onChange={(e) => setGamificationSettings({
                                        ...gamificationSettings,
                                        points: { ...gamificationSettings.points, content_generated: Number(e.target.value) }
                                    })}
                                    className="px-3 py-2 border rounded-lg"
                                />
                                <label className="text-sm text-gray-600">Exercise Points</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={gamificationSettings.points.exercise_completed}
                                    onChange={(e) => setGamificationSettings({
                                        ...gamificationSettings,
                                        points: { ...gamificationSettings.points, exercise_completed: Number(e.target.value) }
                                    })}
                                    className="px-3 py-2 border rounded-lg"
                                />
                                <label className="text-sm text-gray-600">Login Points</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={gamificationSettings.points.login}
                                    onChange={(e) => setGamificationSettings({
                                        ...gamificationSettings,
                                        points: { ...gamificationSettings.points, login: Number(e.target.value) }
                                    })}
                                    className="px-3 py-2 border rounded-lg"
                                />
                                <label className="text-sm text-gray-600">Profile Update Points</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={gamificationSettings.points.profile_update}
                                    onChange={(e) => setGamificationSettings({
                                        ...gamificationSettings,
                                        points: { ...gamificationSettings.points, profile_update: Number(e.target.value) }
                                    })}
                                    className="px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="text-sm text-gray-600">Content Badge Threshold</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={gamificationSettings.badges.content_count}
                                    onChange={(e) => setGamificationSettings({
                                        ...gamificationSettings,
                                        badges: { ...gamificationSettings.badges, content_count: Number(e.target.value) }
                                    })}
                                    className="px-3 py-2 border rounded-lg"
                                />
                                <label className="text-sm text-gray-600">Exercise Badge Threshold</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={gamificationSettings.badges.exercise_count}
                                    onChange={(e) => setGamificationSettings({
                                        ...gamificationSettings,
                                        badges: { ...gamificationSettings.badges, exercise_count: Number(e.target.value) }
                                    })}
                                    className="px-3 py-2 border rounded-lg"
                                />
                                <label className="text-sm text-gray-600">Streak 3 Threshold</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={gamificationSettings.badges.streak_3}
                                    onChange={(e) => setGamificationSettings({
                                        ...gamificationSettings,
                                        badges: { ...gamificationSettings.badges, streak_3: Number(e.target.value) }
                                    })}
                                    className="px-3 py-2 border rounded-lg"
                                />
                                <label className="text-sm text-gray-600">Streak 7 Threshold</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={gamificationSettings.badges.streak_7}
                                    onChange={(e) => setGamificationSettings({
                                        ...gamificationSettings,
                                        badges: { ...gamificationSettings.badges, streak_7: Number(e.target.value) }
                                    })}
                                    className="px-3 py-2 border rounded-lg"
                                />
                                <label className="text-sm text-gray-600">Points Badge Threshold</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={gamificationSettings.badges.points_100}
                                    onChange={(e) => setGamificationSettings({
                                        ...gamificationSettings,
                                        badges: { ...gamificationSettings.badges, points_100: Number(e.target.value) }
                                    })}
                                    className="px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <button type="submit" className="btn-primary">Save Gamification</button>
                        </>
                    )}
                </form>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Broadcast Notification</h2>
                <form onSubmit={sendBroadcast} className="space-y-3">
                    <textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        placeholder="Enter broadcast message"
                        required
                    />
                    <button type="submit" className="btn-primary">Send Broadcast</button>
                </form>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                    {broadcasts.map((item) => (
                        <div key={item._id} className="border rounded-lg px-3 py-2">
                            {item.message}
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-xl font-bold">Reports</h2>
                <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => downloadReport('progress')} className="btn-primary">Download Progress CSV</button>
                    <button type="button" onClick={() => downloadReport('logs')} className="btn-primary">Download Logs CSV</button>
                </div>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-xl font-bold">Backups</h2>
                <button type="button" onClick={createBackup} className="btn-primary">Create Backup</button>
                <div className="space-y-2 text-sm text-gray-600">
                    {backups.map((backup) => (
                        <div key={backup._id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                            <span>{backup.filename}</span>
                            <button type="button" onClick={() => restoreBackup(backup.filename)} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded">
                                Restore
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Admin;
