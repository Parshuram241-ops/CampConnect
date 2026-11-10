const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/products
 * @desc    Get all products with filters
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/my-listings
 * @desc    Get current user's products
 * @access  Private
 */
router.get('/my-listings', protect, productController.getMyListings);

router.route('/:id/deal-request')
  .post(protect, productController.requestProductDeal)
  .delete(protect, productController.cancelProductDealRequest);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product listing
 * @access  Private
 */
router.post('/', protect, productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Owner only)
 */
router.put('/:id', protect, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private (Owner only)
 */
router.delete('/:id', protect, productController.deleteProduct);

module.exports = router;
