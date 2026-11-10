const express = require('express');
const router = express.Router();
const {
  getUsers,
  toggleUserStatus,
  deleteUser,
  getListings,
  getDealRequests,
  reviewDealRequest,
  deleteListing,
  removeProductDeal,
  getStats,
  toggleListing,
  getReports,
  resolveReport
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Apply protection and admin check to all routes in this file
router.use(protect, adminOnly);

// User Management Routes
router.route('/users')
  .get(getUsers);

router.route('/users/:id/suspend')
  .put(toggleUserStatus);

router.route('/users/:id')
  .delete(deleteUser);

// Listing Management Routes
router.route('/products')
  .get(getListings);

router.route('/products/:id')
  .delete(deleteListing);

router.route('/stats')
  .get(getStats);

router.route('/deal-requests')
  .get(getDealRequests);

router.route('/deal-requests/:id/review')
  .put(reviewDealRequest);

router.route('/products/:id/toggle')
  .put(toggleListing);

router.route('/products/:id/deal')
  .delete(removeProductDeal);

// Reports Management Routes
router.route('/reports')
  .get(getReports);

router.route('/reports/:id/resolve')
  .put(resolveReport);

module.exports = router;
