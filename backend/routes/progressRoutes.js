const express = require('express');
const { getSummary, getHistory, updateWeeklyGoal, recordExercise } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', protect, getSummary);
router.get('/history', protect, getHistory);
router.put('/weekly-goal', protect, updateWeeklyGoal);
router.post('/exercise', protect, recordExercise);

module.exports = router;
