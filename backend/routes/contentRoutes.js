const express = require('express');
const { generateContent, getHistory, getContent, rateContent, translateContent } = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate', protect, generateContent);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getContent);
router.put('/:id/rate', protect, rateContent);
router.post('/:id/translate', protect, translateContent);

module.exports = router;
