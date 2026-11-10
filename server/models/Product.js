const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'books',
        'electronics',
        'study-materials',
        'furniture',
        'hostel-essentials',
        'lab-equipment',
        'clothing',
        'sports-fitness',
        'others',
      ],
    },
    condition: {
      type: String,
      required: [true, 'Product condition is required'],
      enum: ['Brand New', 'Like New', 'Excellent', 'Good', 'Fair', 'Used'],
    },
    type: {
      type: String,
      required: [true, 'Listing type is required'],
      enum: ['For Sale', 'For Rent', 'Exchange', 'Free'],
      default: 'For Sale',
    },
    price: {
      type: Number,
      required: function () {
        return this.type !== 'Free';
      },
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: {
        validator: function (v) {
          return v && v.length > 0 && v.length <= 5;
        },
        message: 'You must upload between 1 and 5 images',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller information is required'],
    },
    status: {
      type: String,
      enum: ['Available', 'Sold', 'Rented', 'Inactive'],
      default: 'Available',
    },
    views: {
      type: Number,
      default: 0,
    },
    brand: {
      type: String,
      trim: true,
    },
    negotiable: {
      type: Boolean,
      default: true,
    },
    dealPrice: {
      type: Number,
      min: [0, 'Deal price cannot be negative'],
      default: null,
    },
    dealExpiresAt: {
      type: Date,
      default: null,
    },
    dealRequest: {
      dealPrice: {
        type: Number,
        min: [0, 'Requested deal price cannot be negative'],
      },
      expiresAt: Date,
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Withdrawn', 'Ended'],
      },
      requestedAt: Date,
      reviewedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for faster queries
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'dealRequest.status': 1, 'dealRequest.requestedAt': 1 });

// Virtual for formatted posted date
productSchema.virtual('postedDate').get(function () {
  return this.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
