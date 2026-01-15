const express = require('express');
const { createShare, getPublicShares, getMyShares } = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPublicShares);
router.get('/mine', protect, getMyShares);
router.post('/', protect, createShare);

module.exports = router;
