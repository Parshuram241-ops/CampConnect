// Load environment variables first
require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  const requiredProductionVariables = [
    'MONGO_URI',
    'JWT_SECRET',
    'SESSION_SECRET',
  ];
  const missingVariables = requiredProductionVariables.filter(
    (name) => !process.env[name]
  );

  if (process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_SECRET) {
    ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'CLIENT_URL', 'BACKEND_URL']
      .filter((name) => !process.env[name])
      .forEach((name) => missingVariables.push(name));
  }

  if (missingVariables.length > 0) {
    console.error(
      `Missing required production environment variables: ${missingVariables.join(', ')}`
    );
    process.exit(1);
  }
}

const app = require('./app');
const connectDB = require('./config/db');
const { configureGoogleStrategy } = require('./services/googleAuthService');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to MongoDB
connectDB();

// The manual Google OAuth callback does not require Passport strategy setup.
// Configure the strategy only when its credentials are present.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  configureGoogleStrategy();
}

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 API listening on port ${PORT}`);
  console.log(`🏥 Health check: /api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
