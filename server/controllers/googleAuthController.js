const axios = require('axios');
const qs = require('querystring');
const User = require('../models/User');
const { generateToken, setTokenCookie } = require('../utils/generateToken');

/**
 * @desc    Get Google OAuth URL
 * @route   GET /api/auth/google/url
 * @access  Public
 */
const getGoogleAuthURL = (req, res) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  // Determine client origin dynamically so callbacks work seamlessly on any port (5173, 5174, etc.)
  const clientUrl =
    req.query.client_url ||
    req.headers.referer ||
    process.env.CLIENT_URL ||
    'http://localhost:5173';

  let cleanClientUrl;
  try {
    cleanClientUrl = new URL(clientUrl).origin;
  } catch {
    cleanClientUrl = 'http://localhost:5173';
  }

  // Encode clientUrl into state so the callback knows exactly where to redirect the user
  const state = Buffer.from(
    JSON.stringify({ clientUrl: cleanClientUrl })
  ).toString('base64');

  const options = {
    redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    state,
  };

  const authURL = `${rootUrl}?${qs.stringify(options)}`;

  res.json({
    success: true,
    data: {
      authURL,
    },
  });
};

/**
 * @desc    Handle Google OAuth callback
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
const handleGoogleCallback = async (req, res) => {
  const { code, error, state } = req.query;

  // Retrieve frontend client URL from state parameter
  let clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  if (state) {
    try {
      const parsedState = JSON.parse(
        Buffer.from(state, 'base64').toString('utf8')
      );
      if (parsedState.clientUrl) {
        clientUrl = parsedState.clientUrl;
      }
    } catch (e) {
      console.warn('Could not parse Google OAuth state param:', e.message);
    }
  }

  if (error) {
    return res.redirect(
      `${clientUrl}/login?error=${encodeURIComponent(error)}`
    );
  }

  try {
    // 1. Exchange authorization code for Google access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;

    // 2. Fetch user profile from Google
    const userResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { id: googleId, name, picture } = userResponse.data;

    // 3. User Storage:
    // User explicitly requested:
    // "and the user who have logged into the system through the google auth by using their gmail their mail should not be stored in the data base"
    // So for Google Auth users, we store user document in MongoDB (for real _id and features),
    // but the email field is NOT stored in the database.
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        googleId,
        name: name || 'Google Student',
        avatar:
          picture ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        authMethod: 'google',
        isVerified: true,
        isEmailVerified: true,
        role: 'student',
        // Note: email is explicitly omitted and NOT saved in MongoDB
      });
    } else {
      let modified = false;
      if (name && user.name !== name) {
        user.name = name;
        modified = true;
      }
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        modified = true;
      }
      // If user document previously had an email, clear it to satisfy the requirement
      if (user.email) {
        user.email = undefined;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    }

    // 4. Generate standard JWT token with the real MongoDB user._id
    const token = generateToken(user._id, user.role);

    // Set HTTP-only cookie for secure browser sessions
    setTokenCookie(res, token);

    // 5. Structure payload for the frontend
    const userData = {
      _id: user._id.toString(),
      id: user._id.toString(),
      googleId: user.googleId,
      name: user.name,
      avatar: user.avatar,
      authMethod: 'google',
      role: user.role,
      isVerified: user.isVerified,
      // email is NOT stored in database and NOT returned
    };

    // 6. Redirect to frontend with token and user data
    const redirectUrl = new URL(`${clientUrl}/auth/google/success`);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set(
      'user',
      encodeURIComponent(JSON.stringify(userData))
    );

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Google OAuth error:', error);
    const errorMessage =
      error.response?.data?.error_description ||
      error.message ||
      'Google authentication failed';
    res.redirect(
      `${clientUrl}/login?error=${encodeURIComponent(errorMessage)}`
    );
  }
};

module.exports = {
  getGoogleAuthURL,
  handleGoogleCallback,
};