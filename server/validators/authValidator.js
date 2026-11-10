/**
 * Validation functions for authentication
 */

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  console.log('🔍 Register validation:', { name, email, password: password ? '***' : 'undefined' });

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.trim().length > 50) {
    errors.push('Name cannot exceed 50 characters');
  }

  // Email validation
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please provide a valid email address');
    }
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // NOTE: confirmPassword is validated on frontend only
  // No need to validate here since frontend ensures it matches before sending

  console.log('📋 Validation errors:', errors);

  // If there are validation errors, return them
  if (errors.length > 0) {
    console.log('❌ Validation failed with errors:', errors);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors,
    });
  }

  console.log('✅ Validation passed');
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors,
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
