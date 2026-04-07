const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { sendOTP, verifyOTP } = require('../controllers/otpController');

// Standard Login
router.post('/login', login);

// OTP Login
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;
