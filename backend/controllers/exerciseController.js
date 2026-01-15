const Content = require('../models/Content');
const ReviewItem = require('../models/ReviewItem');
const progressService = require('../services/progressService');

const normalizeAnswer = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim().toLowerCase();
};

const normalizeAnswersInput = (answers) => {
    if (!Array.isArray(answers)) return [];
    if (answers.length === 0) return [];

    if (typeof answers[0] === 'string') {
        return answers.map((answer, index) => ({ index, answer }));
    }

    return answers
        .map((item) => ({
            index: Number(item.index),
            answer: item.answer
        }))
        .filter((item) => Number.isInteger(item.index));
};

// @desc    Submit exercise answers and get feedback
// @route   POST /api/exercises/submit
// @access  Private
exports.submitAnswers = async (req, res) => {
    const { contentId, answers } = req.body;

    if (!contentId) {
        return res.status(400).json({ success: false, message: 'contentId is required' });
    }

    const normalizedAnswers = normalizeAnswersInput(answers);
    if (normalizedAnswers.length === 0) {
        return res.status(400).json({ success: false, message: 'answers are required' });
    }

    try {
        const content = await Content.findById(contentId);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        if (content.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const exercises = content.exercises || [];
        const answerMap = new Map(normalizedAnswers.map((item) => [item.index, item.answer]));

        const results = exercises.map((exercise, index) => {
            const userAnswer = answerMap.get(index);
            const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(exercise.correctAnswer);
            return {
                index,
                question: exercise.question,
                userAnswer: userAnswer || '',
                correct: isCorrect,
                correctAnswer: exercise.correctAnswer,
                explanation: exercise.explanation,
                focusWord: exercise.focusWord || ''
            };
        });

        const incorrectItems = results.filter((result) => !result.correct && result.focusWord);
        for (const item of incorrectItems) {
            const word = String(item.focusWord).trim();
            if (!word) continue;

            await ReviewItem.findOneAndUpdate(
                { user: req.user.id, word },
                {
                    $set: {
                        context: item.question || '',
                        sourceContent: content._id,
                        lastMissedAt: new Date()
                    },
                    $inc: { timesMissed: 1 },
                    $setOnInsert: { createdAt: new Date() }
                },
                { upsert: true, new: true }
            );
        }

        if (exercises.length > 0) {
            await progressService.recordActivity(req.user.id, {
                type: 'exercise_completed',
                count: exercises.length,
                metadata: { contentId: content._id }
            });
        }

        const correctCount = results.filter((result) => result.correct).length;
        const total = results.length;
        const score = total ? Math.round((correctCount / total) * 100) : 0;

        res.status(200).json({
            success: true,
            data: {
                results,
                summary: {
                    total,
                    correct: correctCount,
                    score,
                    reviewAdded: incorrectItems.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
