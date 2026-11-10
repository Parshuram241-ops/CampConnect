const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('./emailService');

/**
 * Configure Google OAuth Strategy
 */
const configureGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const emailDomain = email.split('@')[1];
          
          // Validate college email domain (e.g., @giet.edu)
          const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || [];
          
          if (!allowedDomains.includes(emailDomain)) {
            return done(null, false, { 
              message: `Only college emails are allowed. Allowed domains: ${allowedDomains.join(', ')}` 
            });
          }

          // Check if user exists with Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists with Google auth
            return done(null, user);
          }

          // Check if user exists with email (but different auth method)
          user = await User.findOne({ email });

          if (user) {
            // User exists with email but different auth method
            return done(null, false, { 
              message: 'Email already registered with different authentication method' 
            });
          }

          // Create new user with Google auth
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: email,
            emailDomain: emailDomain,
            avatar: profile.photos[0]?.value,
            authMethod: 'google',
            isVerified: false, // OTP verification required
          });

          // Generate and send OTP
          const otp = await generateOTP(user._id, email);
          await sendOTPEmail(email, user.name, otp.code);

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

/**
 * Generate Google OAuth URL
 */
const getGoogleAuthURL = (req, res) => {
  const authURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    process.env.GOOGLE_CLIENT_ID
  }&redirect_uri=${
    encodeURIComponent(`${process.env.BACKEND_URL}/api/auth/google/callback`)
  }&response_type=code&scope=profile%20email&access_type=offline&prompt=consent`;

  res.json({
    success: true,
    data: {
      authURL,
    },
  });
};

/**
 * Handle Google OAuth Callback
 */
const handleGoogleCallback = (req, res, next) => {
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }, async (error, user, info) => {
    if (error) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(info?.message || 'Authentication failed')}`);
    }

    try {
      // Store user in session
      req.session.userId = user._id;
      req.session.email = user.email;
      req.session.name = user.name;
      
      // Redirect to OTP verification page with user data
      const redirectUrl = new URL(`${process.env.CLIENT_URL}/verify-otp`);
      redirectUrl.searchParams.set('userId', user._id.toString());
      redirectUrl.searchParams.set('email', user.email);
      redirectUrl.searchParams.set('name', user.name || '');
      
      res.redirect(redirectUrl.toString());
    } catch (err) {
      console.error('Session storage error:', err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=session_error`);
    }
  })(req, res, next);
};

module.exports = {
  configureGoogleStrategy,
  getGoogleAuthURL,
  handleGoogleCallback,
};