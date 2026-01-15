const express = require('express');
const { submitAnswers } = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/submit', protect, submitAnswers);

module.exports = router;
