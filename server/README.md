# CampConnect Backend

Backend API for CampConnect - Multi-Vendor Campus Marketplace

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your `.env` file with your actual values:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Running the Server

**Development mode (with nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   └── authController.js     # Auth request handlers
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── adminMiddleware.js    # Admin authorization
│   └── errorMiddleware.js    # Error handling
├── models/
│   └── User.js               # User schema
├── routes/
│   └── authRoutes.js         # Auth endpoints
├── services/
│   └── authService.js        # Business logic
├── utils/
│   └── generateToken.js      # JWT utilities
├── validators/
│   └── authValidator.js      # Input validation
├── app.js                    # Express app setup
├── server.js                 # Server entry point
├── package.json              # Dependencies
└── .env.example              # Environment template
```

## 🔐 Authentication Endpoints

All endpoints are documented in [`/docs/API.md`](../docs/API.md)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

## 🧪 Testing

Test the API health:
```bash
curl http://localhost:5000/api/health
```

Use Postman, Thunder Client, or any HTTP client to test the authentication endpoints.

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT authentication
- ✅ HTTP-only cookies
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling

## 🛠️ Technologies

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + bcryptjs
- **Security:** cors, cookie-parser

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No (default: 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT | Yes |
| `JWT_EXPIRES_IN` | Token expiration time | No (default: 7d) |
| `CLIENT_URL` | Frontend URL for CORS | No (default: http://localhost:5173) |

## 🚧 Coming Soon

- Product management APIs
- Wishlist functionality
- Messaging system
- File upload (Cloudinary)
- Email verification
- Password reset
- Admin dashboard
- Advanced search
- Socket.IO for real-time features

## 📚 Documentation

Complete API documentation is available at `/docs/API.md`

## 🤝 Contributing

This is a private project. Contact the team for contribution guidelines.

## 📄 License

ISC

---

**CampConnect Backend v1.0.0**
