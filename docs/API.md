# CampConnect API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Module

All authentication endpoints use JSON format for requests and responses.

---

### 1. Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `confirmPassword`: Required, must match password

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d...",
      "role": "student",
      "isVerified": false,
      "isEmailVerified": false,
      "rating": 0,
      "totalSales": 0,
      "totalPurchases": 0,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

*400 Bad Request - Validation Error:*
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Name is required",
    "Email is required"
  ]
}
```

*400 Bad Request - Email Exists:*
```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### 2. Login User

Authenticate user and receive access token.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `email`: Required
- `password`: Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d...",
      "role": "student",
      "isVerified": false,
      "isEmailVerified": false,
      "rating": 0,
      "totalSales": 0,
      "totalPurchases": 0,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

*400 Bad Request - Validation Error:*
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Password is required"
  ]
}
```

*401 Unauthorized - Invalid Credentials:*
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Logout User

Clear authentication token and logout user.

**Endpoint:** `POST /api/auth/logout`

**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer {token}
```
or token will be read from HTTP-only cookie.

**Request Body:** None required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Responses:**

*401 Unauthorized - Not Authenticated:*
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

*401 Unauthorized - Invalid Token:*
```json
{
  "success": false,
  "message": "Token invalid or expired. Please login again."
}
```

---

### 4. Get Current User

Retrieve authenticated user's profile information.

**Endpoint:** `GET /api/auth/me`

**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer {token}
```
or token will be read from HTTP-only cookie.

**Request Body:** None required

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d...",
      "phone": "9876543210",
      "department": "CSE",
      "year": "3rd Year",
      "hostel": "Boys Hostel A",
      "bio": "Tech enthusiast and active marketplace user",
      "role": "student",
      "isVerified": false,
      "isEmailVerified": false,
      "rating": 4.5,
      "totalSales": 12,
      "totalPurchases": 8,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

*401 Unauthorized - Not Authenticated:*
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

*401 Unauthorized - User Not Found:*
```json
{
  "success": false,
  "message": "User not found. Token invalid."
}
```

---

## Authentication Methods

The API supports two authentication methods:

### 1. HTTP-Only Cookie (Recommended)
The token is automatically set as an HTTP-only cookie upon login/register.
No need to manually send the token - it's sent automatically with each request.

### 2. Authorization Header
Include the token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid input or validation error
- **401 Unauthorized** - Authentication required or failed
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## Testing with Postman/Thunder Client

### Example 1: Register a New User

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@campus.edu",
  "password": "secure123",
  "confirmPassword": "secure123"
}
```

### Example 2: Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "alice@campus.edu",
  "password": "secure123"
}
```

### Example 3: Get Current User (with token)

```
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example 4: Logout

```
POST http://localhost:5000/api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Security Features

1. **Password Hashing** - bcryptjs with salt rounds
2. **JWT Authentication** - Stateless token-based auth
3. **HTTP-Only Cookies** - XSS protection
4. **CORS Configuration** - Controlled cross-origin access
5. **Input Validation** - Prevents invalid data
6. **Password Never Returned** - Excluded from API responses
7. **Token Expiration** - 7-day expiry by default

---

## Future Endpoints (Coming Soon)

- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/update-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/verify-email/:token` - Verify email address

---

## Health Check

Test if the API is running:

```
GET http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "message": "CampConnect API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

*Last Updated: January 2024*
*API Version: 1.0.0*
