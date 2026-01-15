import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users } from 'lucide-react';

const formatType = (type) => {
    switch (type) {
        case 'content':
            return 'Shared Content';
        case 'progress':
            return 'Shared Progress';
        case 'badge':
            return 'Shared Badge';
        default:
            return type;
    }
};

const Community = () => {
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchShares = async () => {
            try {
                const { data } = await axios.get('/api/shares');
                if (data.success) {
                    setShares(data.data);
                }
            } catch (err) {
                setError('Failed to load community feed');
            } finally {
                setLoading(false);
            }
        };
        fetchShares();
    }, []);

    if (loading) return <div className="text-center py-10">Loading community feed...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center space-x-3 mb-6">
                <Users className="h-7 w-7 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            {shares.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No shared content yet.</div>
            ) : (
                <div className="space-y-4">
                    {shares.map((share) => (
                        <div key={share._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-sm text-indigo-600 font-semibold">{formatType(share.type)}</div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {share.content?.title || 'Progress Update'}
                                    </h3>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Shared by {share.user?.name || 'User'} on {new Date(share.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">{share.content?.type || share.type}</div>
                            </div>

                            {share.type === 'content' && share.content && (
                                <div className="mt-3 text-sm text-gray-600">
                                    Level: {share.content.level} • Type: {share.content.type}
                                </div>
                            )}

                            {share.type === 'progress' && (
                                <div className="mt-3 text-sm text-gray-600">
                                    Points: {share.data?.points || 0} • Streak: {share.data?.streak || 0} days
                                </div>
                            )}

                            {share.type === 'progress' && share.data?.badges?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {share.data.badges.map((badge) => (
                                        <span key={badge} className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Community;
