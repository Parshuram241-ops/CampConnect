const Product = require('../models/Product');

const addDealPricing = (product, now = new Date()) => {
  const dealIsActive =
    product.status === 'Available' &&
    product.dealRequest?.status === 'Approved' &&
    Number.isFinite(product.dealPrice) &&
    product.dealPrice > 0 &&
    product.dealPrice < product.price &&
    product.dealExpiresAt &&
    new Date(product.dealExpiresAt) > now;

  return {
    ...product,
    originalPrice: dealIsActive ? product.price : null,
    price: dealIsActive ? product.dealPrice : product.price,
    isDealActive: Boolean(dealIsActive),
  };
};

/**
 * @desc    Create a new product listing
 * @route   POST /api/products
 * @access  Private
 */
const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      type,
      price,
      images,
      location,
      contactNumber,
      brand,
      negotiable,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !condition || !location || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate images
    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image',
      });
    }

    // Validate price for non-free items
    if (type !== 'Free' && (!price || price <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid price',
      });
    }

    // Create product
    const product = await Product.create({
      title,
      description,
      category: category.toLowerCase().replace(/\s+/g, '-'),
      condition,
      type: type || 'For Sale',
      price: type === 'Free' ? 0 : price,
      images,
      location,
      contactNumber,
      seller: req.user._id,
      brand: brand || undefined,
      negotiable: negotiable !== undefined ? negotiable : true,
    });

    // Populate seller information
    await product.populate('seller', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Product listed successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

/**
 * @desc    Get all products with filters
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      type,
      condition,
      minPrice,
      maxPrice,
      search,
      location,
      status,
      sort = '-createdAt',
      page = 1,
      limit = 20,
      dealsOnly,
    } = req.query;

    // Build query
    const query = {};

    if (status === 'All') {
      query.status = { $ne: 'Inactive' };
    } else if (status) {
      query.status = status;
    } else {
      query.status = 'Available';
    }
    if (dealsOnly === 'true') {
      query.dealPrice = { $gt: 0 };
      query.dealExpiresAt = { $gt: new Date() };
      query.type = 'For Sale';
      query['dealRequest.status'] = 'Approved';
      query.$expr = { $lt: ['$dealPrice', '$price'] };
    }

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    if (condition) {
      query.condition = condition;
    }

    if (location) {
      query.location = location;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      const priceField = dealsOnly === 'true' ? 'dealPrice' : 'price';
      query[priceField] = {};
      if (minPrice) query[priceField].$gte = parseFloat(minPrice);
      if (maxPrice) query[priceField].$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query and total count in parallel for maximum speed
    const [products, count] = await Promise.all([
      Product.find(query)
        .populate('seller', 'name email avatar')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean(),
      Product.countDocuments(query),
    ]);
    const serverTime = new Date();

    res.status(200).json({
      success: true,
      data: products.map((product) => addDealPricing(product, serverTime)),
      serverTime: serverTime.toISOString(),
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    // Atomically increment views and return the populated product
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('seller', 'name email avatar')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.status === 'Inactive') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: addDealPricing(product),
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Owner only)
 */
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user is the owner
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product',
      });
    }

    // Deal fields are managed only through admin endpoints.
    const updates = { ...req.body };
    delete updates.dealPrice;
    delete updates.dealExpiresAt;
    if (
      updates.price !== undefined &&
      product.dealPrice &&
      Number(updates.price) <= product.dealPrice
    ) {
      updates.dealPrice = null;
      updates.dealExpiresAt = null;
    }
    if (updates.type && updates.type !== 'For Sale') {
      updates.dealPrice = null;
      updates.dealExpiresAt = null;
    }

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('seller', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Owner only)
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user is the owner
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product',
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
    });
  }
};

/**
 * @desc    Get current user's products
 * @route   GET /api/products/my-listings
 * @access  Private
 */
const getMyListings = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort('-createdAt')
      .lean();

    res.status(200).json({
      success: true,
      data: products.filter((product) => product.status !== 'Inactive'),
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your listings',
    });
  }
};

/**
 * @desc    Request a seller-consented limited-time deal
 * @route   POST /api/products/:id/deal-request
 * @access  Private (Owner only)
 */
const requestProductDeal = async (req, res) => {
  try {
    const requestedDealPrice = Number(req.body.dealPrice);
    const expiry = new Date(req.body.dealExpiresAt);
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your listings',
      });
    }
    if (product.status !== 'Available' || product.type !== 'For Sale' || product.price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Only available products for sale can request a deal',
      });
    }
    if (
      product.dealRequest?.status === 'Pending' ||
      (product.dealRequest?.status === 'Approved' &&
        product.dealPrice > 0 &&
        product.dealExpiresAt > new Date())
    ) {
      return res.status(409).json({
        success: false,
        message: 'This product already has a pending request or active deal',
      });
    }
    if (!Number.isFinite(requestedDealPrice) || requestedDealPrice <= 0 || requestedDealPrice >= product.price) {
      return res.status(400).json({
        success: false,
        message: 'Requested deal price must be greater than zero and lower than the listing price',
      });
    }
    if (!req.body.dealExpiresAt || Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Deal expiry must be a valid future date and time',
      });
    }

    const now = new Date();
    const update = await Product.updateOne(
      {
        _id: product._id,
        seller: req.user._id,
        status: 'Available',
        type: 'For Sale',
        price: { $gt: requestedDealPrice },
        'dealRequest.status': { $ne: 'Pending' },
        $or: [
          { 'dealRequest.status': { $ne: 'Approved' } },
          { dealExpiresAt: { $exists: false } },
          { dealExpiresAt: null },
          { dealExpiresAt: { $lte: now } },
        ],
      },
      {
        $set: {
          dealRequest: {
            dealPrice: requestedDealPrice,
            expiresAt: expiry,
            status: 'Pending',
            requestedAt: now,
          },
        },
      }
    );
    if (!update.modifiedCount) {
      return res.status(409).json({
        success: false,
        message: 'The listing changed or already has a pending request or active deal',
      });
    }
    const updatedProduct = await Product.findById(product._id);

    return res.status(201).json({
      success: true,
      message: 'Deal request submitted for admin review',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Request product deal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit deal request',
    });
  }
};

/**
 * @desc    Withdraw a pending request or end the seller's active deal early
 * @route   DELETE /api/products/:id/deal-request
 * @access  Private (Owner only)
 */
const cancelProductDealRequest = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your listings',
      });
    }

    const now = new Date();
    const withdrawn = await Product.findOneAndUpdate(
      { _id: product._id, seller: req.user._id, 'dealRequest.status': 'Pending' },
      {
        $set: {
          'dealRequest.status': 'Withdrawn',
          'dealRequest.reviewedAt': now,
        },
        $unset: { 'dealRequest.reviewedBy': 1 },
      },
      { new: true }
    );
    if (withdrawn) {
      return res.json({
        success: true,
        message: 'Deal request withdrawn',
        data: withdrawn,
      });
    }

    const ended = await Product.findOneAndUpdate(
      {
        _id: product._id,
        seller: req.user._id,
        'dealRequest.status': 'Approved',
        dealPrice: { $gt: 0 },
        dealExpiresAt: { $gt: now },
      },
      {
        $set: {
          'dealRequest.status': 'Ended',
          'dealRequest.reviewedAt': now,
          dealPrice: null,
          dealExpiresAt: null,
        },
      },
      { new: true }
    );
    if (!ended) {
      return res.status(409).json({
        success: false,
        message: 'There is no pending request or active deal to cancel',
      });
    }

    return res.json({
      success: true,
      message: 'Active deal ended',
      data: ended,
    });
  } catch (error) {
    console.error('Cancel product deal request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel deal request',
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyListings,
  requestProductDeal,
  cancelProductDealRequest,
};
