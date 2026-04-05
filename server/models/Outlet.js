const mongoose = require('mongoose');

const outletSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Outlet name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Outlet image is required'],
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [5, 'Preparation time must be at least 5 minutes'],
    max: [60, 'Preparation time cannot exceed 60 minutes']
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    opening: {
      type: String,
      required: [true, 'Opening time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
    },
    closing: {
      type: String,
      required: [true, 'Closing time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
    }
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Outlet admin is required']
  },
  menuCategories: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for faster queries
outletSchema.index({ name: 1 });
outletSchema.index({ adminId: 1 });
outletSchema.index({ isOpen: 1 });

const Outlet = mongoose.model('Outlet', outletSchema);

module.exports = { Outlet };
