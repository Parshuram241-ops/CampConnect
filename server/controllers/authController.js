const authService = require('../services/authService');
const { setTokenCookie, clearTokenCookie } = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
    });

    // Set token as HTTP-only cookie
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    console.log('Login attempt:', { email: req.body.email, password: req.body.password ? '***' : 'undefined' });
    const { email, password } = req.body;

    const { user, token } = await authService.loginUser(email, password);

    console.log('Login successful for:', email);

    // Set token as HTTP-only cookie
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    // Clear token cookie
    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    const user = await authService.getUserProfile(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update authenticated user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await authService.updateProfile(req.user._id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user statistics (total users, by auth method)
 * @route   GET /api/auth/stats
 * @access  Public (for testing - make private in production)
 */
const getUserStats = async (req, res, next) => {
  try {
    const User = require('../models/User');
    
    const totalUsers = await User.countDocuments();
    const localAuthUsers = await User.countDocuments({ authMethod: 'local' });
    const googleAuthUsers = await User.countDocuments({ authMethod: 'google' });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        localAuthUsers,
        googleAuthUsers,
        breakdown: {
          'Traditional (Email/Password)': localAuthUsers,
          'Google OAuth': googleAuthUsers,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  getUserStats,
  updateProfile,
};
