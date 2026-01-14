import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, FileText } from 'lucide-react';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/content/history', config);
                if (data.success) {
                    setHistory(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="text-center py-10">Loading history...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Learning History</h1>

            {history.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No content generated yet. Go create something!</div>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => (
                        <div key={item._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-lg ${item.type === 'Story' ? 'bg-purple-100 text-purple-600' :
                                            item.type === 'Exercise' ? 'bg-orange-100 text-orange-600' :
                                                'bg-blue-100 text-blue-600'
                                        }`}>
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{item.title}</h3>
                                        <div className="flex space-x-3 text-sm text-gray-500">
                                            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">{item.level}</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">{item.type}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Could add a 'view' button here to open modal */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
