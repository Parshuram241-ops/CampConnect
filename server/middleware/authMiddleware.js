const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { clearTokenCookie } = require('../utils/generateToken');

/**
 * Protect routes - Verify JWT token and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Prefer the explicitly supplied bearer token over any stale browser cookie.
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      clearTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Token invalid or expired. Please login again.',
      });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      clearTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.',
      });
    }
    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account is suspended. Contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

module.exports = { protect };
