const Product = require('../models/Product');
const User = require('../models/User');
const Report = require('../models/Report');

const createReport = async (req, res, next) => {
  try {
    const { type, reportedId, reason, details } = req.body;

    const normalizedType = String(type || '').trim();
    const reportReason = String(reason || '').trim();

    if (!['Listing', 'User'].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: 'Report type must be Listing or User',
      });
    }

    if (!reportedId) {
      return res.status(400).json({
        success: false,
        message: 'A reported item is required',
      });
    }

    if (reportReason.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid reason for the report',
      });
    }

    const reporterId = req.user._id;

    if (normalizedType === 'Listing') {
      const product = await Product.findById(reportedId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Listing not found',
        });
      }

      const sellerId = product.seller?.toString();
      if (sellerId && sellerId === reporterId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot report your own listing',
        });
      }
    }

    if (normalizedType === 'User') {
      const targetUser = await User.findById(reportedId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (reportedId.toString() === reporterId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot report yourself',
        });
      }
    }

    const existingReport = await Report.findOne({
      type: normalizedType,
      reportedId,
      by: reporterId,
      reason: reportReason,
      status: 'Pending',
    });

    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a report for this item',
      });
    }

    const report = await Report.create({
      type: normalizedType,
      reportedId,
      reason: reportReason,
      by: reporterId,
      details: String(details || '').trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
};
