const mongoose = require('mongoose');
const { orderItemSchema } = require('./MenuItem');

const orderSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outlet',
    required: [true, 'Outlet ID is required']
  },
  items: [orderItemSchema],
  orderType: {
    type: String,
    enum: ['instant', 'scheduled'],
    required: [true, 'Order type is required']
  },
  scheduledPickupTime: {
    type: Date,
    validate: {
      validator: function(value) {
        if (this.orderType === 'scheduled') {
          return value && value > new Date();
        }
        return true;
      },
      message: 'Scheduled pickup time must be in the future for scheduled orders'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  platformFee: {
    type: Number,
    required: [true, 'Platform fee is required'],
    min: [0, 'Platform fee cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'placed',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
    required: true
  },
  specialInstructions: {
    type: String,
    maxlength: [200, 'Special instructions cannot exceed 200 characters'],
    trim: true
  },
  estimatedPrepTime: {
    type: Number,
    required: [true, 'Estimated preparation time is required'],
    min: [5, 'Preparation time must be at least 5 minutes']
  },
  actualPrepTime: {
    type: Number,
    min: [0, 'Actual preparation time cannot be negative']
  },
  placedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  acceptedAt: Date,
  startedPreparingAt: Date,
  readyAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters'],
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ studentId: 1 });
orderSchema.index({ outletId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ scheduledPickupTime: 1 });
orderSchema.index({ placedAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };
