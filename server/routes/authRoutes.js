const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const googleAuthController = require('../controllers/googleAuthController');
const otpController = require('../controllers/otpController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// Public routes
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   GET /api/auth/stats
 * @desc    Get user statistics
 * @access  Public
 */
router.get('/stats', authController.getUserStats);

// Google OAuth routes
/**
 * @route   GET /api/auth/google/url
 * @desc    Get Google OAuth URL
 * @access  Public
 */
router.get('/google/url', googleAuthController.getGoogleAuthURL);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', googleAuthController.handleGoogleCallback);

// OTP routes
/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for Google auth user
 * @access  Public
 */
router.post('/verify-otp', otpController.verifyOtp);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP
 * @access  Public
 */
router.post('/resend-otp', otpController.resendOtp);

// Private routes (require authentication)
/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get authenticated user profile
 * @access  Private
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update authenticated user profile
 * @access  Private
 */
router.put('/profile', protect, authController.updateProfile);

/**
 * @route   POST /api/auth/send-email-verification
 * @desc    Send OTP for email verification
 * @access  Private
 */
router.post('/send-email-verification', protect, otpController.sendEmailVerification);

module.exports = router;
