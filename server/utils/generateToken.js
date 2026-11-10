const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (userId, role = 'student') => {
  const payload = {
    userId,
    role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return token;
};

/**
 * Set JWT token as HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 */
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };

  res.cookie('token', token, cookieOptions);
};

/**
 * Clear authentication cookie
 * @param {Object} res - Express response object
 */
const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

module.exports = {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
};
