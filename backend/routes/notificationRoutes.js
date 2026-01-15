const express = require('express');
const { getActiveNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getActiveNotifications);

module.exports = router;
