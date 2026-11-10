import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_ORIGIN = new URL(API_URL).origin;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

export const storeAuthSession = (user, token) => {
  const authenticatedUser = { ...user, token };
  localStorage.setItem('campconnectUser', JSON.stringify(authenticatedUser));
  localStorage.setItem('campconnectToken', token);
  localStorage.setItem('campconnectLoggedIn', 'true');
  window.dispatchEvent(new Event('campconnect-auth-changed'));
  return authenticatedUser;
};

export const clearAuthSession = () => {
  localStorage.removeItem('campconnectUser');
  localStorage.removeItem('campconnectToken');
  localStorage.removeItem('campconnectLoggedIn');
  window.dispatchEvent(new Event('campconnect-auth-changed'));
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    let userToken;
    try {
      const user = JSON.parse(localStorage.getItem('campconnectUser') || '{}');
      userToken = user.token;
    } catch {
      // A malformed cached profile must not block requests using the standalone token.
    }
    const token = userToken || localStorage.getItem('campconnectToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuthSession();
      if (window.location.pathname !== '/login') {
        window.location.replace('/login?session=expired');
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// PRODUCT API CALLS
// ============================================

/**
 * Create a new product listing
 */
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

/**
 * Get all products with optional filters
 */
export const getAllProducts = async (filters = {}) => {
  const response = await api.get('/products', { params: filters });
  return response.data;
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/**
 * Update a product
 */
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

/**
 * Delete a product
 */
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

/**
 * Get current user's listings
 */
export const getMyListings = async () => {
  const response = await api.get('/products/my-listings');
  return response.data;
};

/**
 * Submit a report for a listing or user
 */
export const reportItem = async ({ type, reportedId, reason, details = '' }) => {
  const response = await api.post('/reports', {
    type,
    reportedId,
    reason,
    details,
  });
  return response.data;
};

// ============================================
// AUTH API CALLS
// ============================================

/**
 * Register a new user
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Update current user profile
 */
export const updateProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  return response.data;
};

export default api;
