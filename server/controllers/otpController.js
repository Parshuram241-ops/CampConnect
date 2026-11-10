const { verifyOTP, resendOTP, generateOTP } = require('../services/emailService');
const { setTokenCookie } = require('../utils/generateToken');

/**
 * @desc    Verify OTP for Google auth user
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { userId, otpCode } = req.body;

    if (!userId || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP code are required',
      });
    }

    // Verify OTP
    const result = await verifyOTP(userId, otpCode);

    // Generate JWT token
    const { generateToken } = require('../utils/generateToken');
    const token = generateToken(result.user._id, result.user.role);

    // Set token as HTTP-only cookie
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        token: token,
      },
    });
  } catch (error) {
    if (error.message === 'User not found' || 
        error.message === 'No OTP found' ||
        error.message === 'OTP has expired' ||
        error.message === 'Invalid OTP') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOtp = async (req, res, next) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: 'User ID and email are required',
      });
    }

    // Resend OTP
    const result = await resendOTP(userId, email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Send OTP for email verification (for local auth users)
 * @route   POST /api/auth/send-email-verification
 * @access  Private
 */
const sendEmailVerification = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Generate OTP for email verification
    const otp = await generateOTP(user._id, user.email);
    
    // Send OTP email
    const { sendOTPEmail } = require('../services/emailService');
    await sendOTPEmail(user.email, user.name, otp.code);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email for verification',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyOtp,
  resendOtp,
  sendEmailVerification,
};