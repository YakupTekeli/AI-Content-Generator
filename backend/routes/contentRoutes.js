const express = require('express');
const { generateContent, getHistory, getContent, rateContent } = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate', protect, generateContent);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getContent);
router.put('/:id/rate', protect, rateContent);

module.exports = router;
