import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { Download, Loader2, Star } from 'lucide-react';

const GenerateContent = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        topic: '',
        keywords: '',
        type: 'Article',
        level: user.languageLevel || 'B1',
        language: 'English'
    });
    const [contentHistory, setContentHistory] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [lastParamsKey, setLastParamsKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ratingLoading, setRatingLoading] = useState(false);
    const [rateMessage, setRateMessage] = useState('');
    const [rateError, setRateError] = useState('');

    const paramsKey = useMemo(() => JSON.stringify(formData), [formData]);
    const currentContent = currentIndex >= 0 ? contentHistory[currentIndex] : null;
    const canGoBack = currentIndex > 0;
    const canGoNext = currentIndex >= 0 && currentIndex < contentHistory.length - 1;
    const dialogueLines = useMemo(() => {
        if (!currentContent || currentContent.type !== 'Dialogue' || !currentContent.body) return [];
        const palette = [
            { bubble: 'bg-indigo-50 border-indigo-100', name: 'text-indigo-600' },
            { bubble: 'bg-emerald-50 border-emerald-100', name: 'text-emerald-600' },
            { bubble: 'bg-amber-50 border-amber-100', name: 'text-amber-600' }
        ];
        const speakerMap = new Map();
        let nextIndex = 0;
        return currentContent.body
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const colonIndex = line.indexOf(':');
                if (colonIndex === -1) {
                    return { speaker: '', text: line, style: palette[0] };
                }
                const speaker = line.slice(0, colonIndex).trim();
                const text = line.slice(colonIndex + 1).trim();
                if (!speakerMap.has(speaker)) {
                    speakerMap.set(speaker, nextIndex % palette.length);
                    nextIndex += 1;
                }
                const style = palette[speakerMap.get(speaker)];
                return { speaker, text, style };
            });
    }, [currentContent]);

    useEffect(() => {
        if (lastParamsKey && lastParamsKey !== paramsKey && contentHistory.length > 0) {
            setContentHistory([]);
            setCurrentIndex(-1);
        }
    }, [lastParamsKey, paramsKey, contentHistory.length]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateContent = async () => {
        if (!formData.topic.trim()) {
            setError('Topic is required');
            return;
        }
        setLoading(true);
        setError('');
        setRateMessage('');
        setRateError('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.post('/api/content/generate', formData, config);
            if (data.success) {
                setContentHistory((prev) => {
                    const base = prev.slice(0, currentIndex + 1);
                    return [...base, data.data];
                });
                setCurrentIndex((prev) => prev + 1);
                setLastParamsKey(paramsKey);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate content');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        generateContent();
    };

    const handleDownload = () => {
        if (!currentContent) return;
        const doc = new jsPDF();
        const title = currentContent.title || 'Generated Content';
        const body = currentContent.body || '';
        const margin = 14;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxWidth = pageWidth - margin * 2;

        doc.setFontSize(16);
        doc.text(title, margin, 20);
        doc.setFontSize(12);

        let y = 30;
        const paragraphs = body.split('\n');
        paragraphs.forEach((paragraph) => {
            const lines = doc.splitTextToSize(paragraph, maxWidth);
            lines.forEach((line) => {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += 7;
            });
            y += 3;
        });

        const safeTitle = title.replace(/[^\w-]+/g, '_').slice(0, 60) || 'content';
        doc.save(`${safeTitle}.pdf`);
    };

    const handleRate = async (value) => {
        if (!currentContent?._id) return;
        setRatingLoading(true);
        setRateMessage('');
        setRateError('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.put(`/api/content/${currentContent._id}/rate`, { rating: value }, config);
            if (data.success) {
                setContentHistory((prev) => prev.map((item, index) => (
                    index === currentIndex ? data.data : item
                )));
                setRateMessage('Thanks for rating!');
            }
        } catch (err) {
            setRateError(err.response?.data?.message || 'Failed to submit rating');
        } finally {
            setRatingLoading(false);
        }
    };

    const handleBack = () => {
        if (canGoBack) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (loading) return;
        if (canGoNext) {
            setCurrentIndex((prev) => prev + 1);
            return;
        }
        generateContent();
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma separated)</label>
                                <input
                                    type="text"
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleChange}
                                    placeholder="e.g. vocabulary, past tense, football"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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

                    {!currentContent && !loading && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            <span className="text-lg">Your content will appear here</span>
                        </div>
                    )}

                    {currentContent && (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">{currentContent.title}</h2>
                                    <button onClick={handleDownload} className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100" title="Download PDF">
                                        <Download className="h-5 w-5" />
                                    </button>
                                </div>

                                {currentContent.type === 'Dialogue' && dialogueLines.length > 0 ? (
                                    <div className="space-y-4">
                                        {dialogueLines.map((line, index) => (
                                            <div key={`dialogue-${index}`} className="flex gap-3 items-start">
                                                <div className={`w-20 shrink-0 text-xs font-semibold uppercase tracking-wide ${line.style.name}`}>
                                                    {line.speaker || 'Narrator'}
                                                </div>
                                                <div className={`flex-1 rounded-2xl border px-4 py-3 text-gray-800 ${line.style.bubble}`}>
                                                    {line.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                        {currentContent.body}
                                    </div>
                                )}

                                {currentContent.type === 'Exercise' && currentContent.exercises?.length > 0 && (
                                    <div className="mt-8 border-t border-gray-100 pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercises</h3>
                                        <div className="space-y-4">
                                            {currentContent.exercises.map((exercise, index) => (
                                                <div
                                                    key={`exercise-${index}`}
                                                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                                >
                                                    <div className="font-medium text-gray-800">
                                                        {index + 1}. {exercise.question}
                                                    </div>
                                                    {exercise.options?.length > 0 && (
                                                        <ul className="mt-3 space-y-1 text-sm text-gray-700">
                                                            {exercise.options.map((option, optionIndex) => (
                                                                <li
                                                                    key={`exercise-${index}-option-${optionIndex}`}
                                                                    className="flex items-start gap-2"
                                                                >
                                                                    <span className="text-gray-500">
                                                                        {String.fromCharCode(65 + optionIndex)}.
                                                                    </span>
                                                                    <span>{option}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {(exercise.correctAnswer || exercise.explanation) && (
                                                        <details className="mt-3 text-sm text-gray-700">
                                                            <summary className="cursor-pointer text-indigo-600">
                                                                Show answer
                                                            </summary>
                                                            {exercise.correctAnswer && (
                                                                <div className="mt-2 text-green-700">
                                                                    Answer: {exercise.correctAnswer}
                                                                </div>
                                                            )}
                                                            {exercise.explanation && (
                                                                <div className="mt-1 text-gray-600">
                                                                    Explanation: {exercise.explanation}
                                                                </div>
                                                            )}
                                                        </details>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col gap-2">
                                    <div className="text-sm font-medium text-gray-700">Rate this content</div>
                                    <div className="flex items-center space-x-1">
                                        {[1, 2, 3, 4, 5].map((value) => {
                                            const isActive = (currentContent.rating || 0) >= value;
                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => handleRate(value)}
                                                    disabled={ratingLoading}
                                                    className="p-1"
                                                    aria-label={`Rate ${value} out of 5`}
                                                >
                                                    <Star
                                                        className={`h-5 w-5 ${isActive ? 'text-yellow-400' : 'text-gray-300'}`}
                                                        fill={isActive ? 'currentColor' : 'none'}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {rateMessage && <div className="text-xs text-green-600">{rateMessage}</div>}
                                    {rateError && <div className="text-xs text-red-600">{rateError}</div>}
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        disabled={!canGoBack || loading}
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={loading}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-sm text-gray-500 flex justify-between">
                                <span>Level: {currentContent.level}</span>
                                <span>Type: {currentContent.type}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateContent;
