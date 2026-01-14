import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Download, Loader2 } from 'lucide-react';

const GenerateContent = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        topic: '',
        type: 'Article',
        level: user.languageLevel || 'B1',
        language: 'English'
    });
    const [generatedContent, setGeneratedContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setGeneratedContent(null);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.post('/api/content/generate', formData, config);
            if (data.success) {
                setGeneratedContent(data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate content');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedContent) return;
        // Simple PDF download logic (client side text file for now, or window print)
        // A real PDF lib involves more setup. "window.print()" is a robust fallback for MVP.
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print</title>');
        printWindow.document.write('</head><body >');
        printWindow.document.write(`<h1>${generatedContent.title}</h1>`);
        printWindow.document.write(`<p>${generatedContent.body.replace(/\n/g, '<br/>')}</p>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Generate New Content</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                                <input
                                    type="text"
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    placeholder="e.g. Space Travel, Cooking..."
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option>Article</option>
                                    <option>Story</option>
                                    <option>Dialogue</option>
                                    <option>Exercise</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                <select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option>A1</option>
                                    <option>A2</option>
                                    <option>B1</option>
                                    <option>B2</option>
                                    <option>C1</option>
                                    <option>C2</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex justify-center items-center space-x-2"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <span>Generate</span>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* content Display Section */}
                <div className="md:col-span-2">
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}

                    {!generatedContent && !loading && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            <span className="text-lg">Your content will appear here</span>
                        </div>
                    )}

                    {generatedContent && (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">{generatedContent.title}</h2>
                                    <button onClick={handleDownload} className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100" title="Download PDF">
                                        <Download className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                    {generatedContent.body}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-sm text-gray-500 flex justify-between">
                                <span>Level: {generatedContent.level}</span>
                                <span>Type: {generatedContent.type}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateContent;
