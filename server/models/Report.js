const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['User', 'Listing'],
      required: true,
    },
    reportedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // We don't strictly ref a single model because it could be User or Product
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: '',
      trim: true,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Resolved'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
