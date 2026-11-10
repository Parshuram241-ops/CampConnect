const User = require('../models/User');
const Product = require('../models/Product');
const Report = require('../models/Report');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (suspend/activate)
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Active or Suspended',
      });
    }
    if (status === 'Suspended' && req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own admin account',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account',
      });
    }
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(409).json({
          success: false,
          message: 'The last admin account cannot be deleted',
        });
      }
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings
// @route   GET /api/admin/products
// @access  Private/Admin
const getListings = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate('seller', 'name email');
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// @desc    List seller-submitted deal requests
// @route   GET /api/admin/deal-requests
// @access  Private/Admin
const getDealRequests = async (req, res, next) => {
  try {
    const requests = await Product.find({ 'dealRequest.status': 'Pending' })
      .populate('seller', 'name email avatar')
      .sort({ 'dealRequest.requestedAt': 1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a seller-submitted deal request
// @route   PUT /api/admin/deal-requests/:id/review
// @access  Private/Admin
const reviewDealRequest = async (req, res, next) => {
  try {
    const decision = req.body.decision;
    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be approve or reject',
      });
    }

    const now = new Date();
    const pendingProduct = await Product.findOne({
      _id: req.params.id,
      'dealRequest.status': 'Pending',
    });
    if (!pendingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Pending deal request not found',
      });
    }

    if (decision === 'approve') {
      if (
        pendingProduct.status !== 'Available' ||
        pendingProduct.type !== 'For Sale' ||
        pendingProduct.dealRequest.expiresAt <= now ||
        pendingProduct.dealRequest.dealPrice <= 0 ||
        pendingProduct.dealRequest.dealPrice >= pendingProduct.price
      ) {
        return res.status(409).json({
          success: false,
          message: 'The listing or requested deal is no longer eligible for approval',
        });
      }

      const update = await Product.updateOne(
        {
          _id: pendingProduct._id,
          status: 'Available',
          type: 'For Sale',
          price: { $gt: pendingProduct.dealRequest.dealPrice },
          'dealRequest.status': 'Pending',
          'dealRequest.expiresAt': { $gt: now },
        },
        {
          $set: {
            dealPrice: pendingProduct.dealRequest.dealPrice,
            dealExpiresAt: pendingProduct.dealRequest.expiresAt,
            'dealRequest.status': 'Approved',
            'dealRequest.reviewedAt': now,
            'dealRequest.reviewedBy': req.user._id,
          },
        }
      );
      if (!update.modifiedCount) {
        return res.status(409).json({
          success: false,
          message: 'The listing changed before the request could be approved; review it again',
        });
      }
    } else {
      const update = await Product.updateOne(
        { _id: pendingProduct._id, 'dealRequest.status': 'Pending' },
        {
          $set: {
            'dealRequest.status': 'Rejected',
            'dealRequest.reviewedAt': now,
            'dealRequest.reviewedBy': req.user._id,
          },
        }
      );
      if (!update.modifiedCount) {
        return res.status(409).json({
          success: false,
          message: 'The request was already reviewed',
        });
      }
    }

    const product = await Product.findById(pendingProduct._id).populate('seller', 'name email avatar');
    res.json({
      success: true,
      message: decision === 'approve' ? 'Seller-approved deal is now live' : 'Deal request rejected',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product listing
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteListing = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a limited-time product deal
// @route   DELETE /api/admin/products/:id/deal
// @access  Private/Admin
const removeProductDeal = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    product.dealPrice = null;
    product.dealExpiresAt = null;
    if (product.dealRequest?.status === 'Approved') {
      product.dealRequest.status = 'Ended';
      product.dealRequest.reviewedAt = new Date();
      product.dealRequest.reviewedBy = req.user._id;
    }
    await product.save();

    res.json({
      success: true,
      message: 'Product deal removed',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary counts
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      availableProducts,
      inactiveProducts,
      soldProducts,
      pendingReports,
      activeDeals,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ status: 'Available' }),
      Product.countDocuments({ status: 'Inactive' }),
      Product.countDocuments({ status: 'Sold' }),
      Report.countDocuments({ status: 'Pending' }),
      Product.countDocuments({
        status: 'Available',
        dealPrice: { $gt: 0 },
        dealExpiresAt: { $gt: new Date() },
        type: 'For Sale',
        'dealRequest.status': 'Approved',
        $expr: { $lt: ['$dealPrice', '$price'] },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        availableProducts,
        inactiveProducts,
        soldProducts,
        pendingReports,
        activeDeals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle listing visibility
// @route   PUT /api/admin/products/:id/toggle
// @access  Private/Admin
const toggleListing = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Available', 'Inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Available or Inactive',
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    if (!['Available', 'Inactive'].includes(product.status)) {
      return res.status(409).json({
        success: false,
        message: 'Only available or inactive listings can be toggled',
      });
    }

    product.status = status;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({}).populate('by', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve a report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private/Admin
const resolveReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      res.status(404);
      throw new Error('Report not found');
    }
    report.status = 'Resolved';
    await report.save();
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
