const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

/**
 * Register a new user (LOCAL AUTH ONLY)
 * @param {Object} userData - User data (name, email, password)
 * @returns {Object} User and token
 */
const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // Validate required fields
  if (!name || !email || !password) {
    throw new Error('Please provide name, email, and password');
  }

  // Validate password length
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Create new user with LOCAL auth method
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password, // Will be hashed by pre-save hook
    authMethod: 'local',
    isVerified: true, // No OTP for local registration
  });

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  // Return user without password
  const userResponse = user.getPublicProfile();

  return {
    user: userResponse,
    token,
  };
};

/**
 * Login user (LOCAL AUTH ONLY)
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} User and token
 */
const loginUser = async (email, password) => {
  // Validate input
  if (!email || !password) {
    throw new Error('Please provide email and password');
  }

  // Find user with password field (only local auth users)
  const user = await User.findOne({ 
    email: email.toLowerCase(),
    authMethod: 'local' 
  }).select('+password');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if password exists (should exist for local users)
  if (!user.password) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  if (user.status === 'Suspended') {
    const error = new Error('This account is suspended. Contact an administrator.');
    error.statusCode = 403;
    throw error;
  }

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  // Return user without password
  const userResponse = user.getPublicProfile();

  return {
    user: userResponse,
    token,
  };
};

/**
 * Get authenticated user profile
 * @param {string} userId - User ID
 * @returns {Object} User data
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user data
 */
const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Update fields
  if (updateData.name) user.name = updateData.name;
  if (updateData.phone) user.phone = updateData.phone;
  if (updateData.department) user.department = updateData.department;
  if (updateData.year) user.year = updateData.year;
  if (updateData.hostel) user.hostel = updateData.hostel;
  if (updateData.bio) user.bio = updateData.bio;
  if (updateData.avatar !== undefined) user.avatar = updateData.avatar;

  const updatedUser = await user.save();
  return updatedUser.getPublicProfile();
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
};
