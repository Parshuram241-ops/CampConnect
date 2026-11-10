const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const compression = require('compression');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express app
const app = express();

// Enable Gzip/Brotli response compression for high performance
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = new Set(
      [
        process.env.CLIENT_URL,
        ...(process.env.CLIENT_URLS || '')
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
        ...(process.env.NODE_ENV === 'production'
          ? []
          : [
              'http://localhost:5173',
              'http://localhost:5174',
              'http://127.0.0.1:5173',
              'http://127.0.0.1:5174',
            ]),
      ].filter(Boolean)
    );
    // Allow non-browser tools (curl, Postman) and allowed origins
    if (!origin || allowed.has(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '25mb' })); // Parse JSON bodies with support for multi-image uploads
app.use(express.urlencoded({ extended: true, limit: '25mb' })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'development-only-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampConnect API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use(notFound);

// Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
