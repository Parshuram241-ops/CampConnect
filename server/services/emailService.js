const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const User = require('../models/User');

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Generate OTP code
 */
const generateOTPCode = () => {
  return otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

/**
 * Generate OTP and save to user
 */
const generateOTP = async (userId, email) => {
  try {
    const otpCode = generateOTPCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Save OTP to user
    await User.findByIdAndUpdate(userId, {
      otp: {
        code: otpCode,
        expiresAt: expiresAt,
      },
      otpVerified: false,
    });

    return {
      code: otpCode,
      expiresAt: expiresAt,
      userId: userId,
      email: email,
    };
  } catch (error) {
    throw new Error('Failed to generate OTP', { cause: error });
  }
};

/**
 * Send OTP email
 */
const sendOTPEmail = async (email, name, otpCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CampConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your CampConnect OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; letter-spacing: 10px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CampConnect</h1>
              <p>Campus Marketplace</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for registering with CampConnect! Please use the following OTP code to verify your email:</p>
              
              <div class="otp-code">${otpCode}</div>
              
              <p>This OTP is valid for 10 minutes.</p>
              
              <p>If you did not request this OTP, please ignore this email.</p>
              
              <p>Best regards,<br>The CampConnect Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} CampConnect. All rights reserved.</p>
              <p>This email was sent to ${email}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}: ${info.messageId}`);
    
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email', { cause: error });
  }
};

/**
 * Verify OTP
 */
const verifyOTP = async (userId, otpCode) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.otp || !user.otp.code) {
    throw new Error('No OTP found');
  }

  // Check if OTP has expired
  if (new Date() > user.otp.expiresAt) {
    throw new Error('OTP has expired');
  }

  // Verify OTP code
  if (user.otp.code !== otpCode) {
    throw new Error('Invalid OTP');
  }

  // Update user as verified
  user.otpVerified = true;
  user.isVerified = true;
  user.isEmailVerified = true;
  user.otp = undefined; // Clear OTP after verification
  
  await user.save();

  return {
    success: true,
    message: 'OTP verified successfully',
    user: user,
  };
};

/**
 * Resend OTP
 */
const resendOTP = async (userId, email) => {
  try {
    // Generate new OTP
    const otp = await generateOTP(userId, email);
    
    // Send OTP email
    const user = await User.findById(userId);
    await sendOTPEmail(email, user.name, otp.code);

    return {
      success: true,
      message: 'New OTP sent to your email',
    };
  } catch (error) {
    throw new Error('Failed to resend OTP', { cause: error });
  }
};

module.exports = {
  createTransporter,
  generateOTPCode,
  generateOTP,
  sendOTPEmail,
  verifyOTP,
  resendOTP,
};