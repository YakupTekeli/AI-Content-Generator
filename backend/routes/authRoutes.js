const express = require('express');
const { register, login, getMe, updateDetails, forgotPassword, verifyResetKey, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.post('/verify-reset-key', verifyResetKey);
router.post('/resetpassword/:resetToken', resetPassword);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

module.exports = router;
