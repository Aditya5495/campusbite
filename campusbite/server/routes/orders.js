const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');
const { authenticate } = require('../middleware/auth');

// Get all orders for the logged-in student
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('outletId', 'name image');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

// Create a new order
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      outletId, 
      items, 
      orderType, 
      scheduledPickupTime, 
      totalAmount, 
      estimatedPrepTime 
    } = req.body;

    const newOrder = new Order({
      studentId: req.user._id,
      outletId,
      items,
      orderType,
      scheduledPickupTime,
      totalAmount,
      estimatedPrepTime,
      status: 'placed',
      paymentStatus: 'paid', // Simulating successful payment
      placedAt: new Date()
    });

    await newOrder.save();
    
    // In a real app, we would emit a socket event to the outlet admin here
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to place order', details: error.message });
  }
});

// Get single order details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      studentId: req.user._id 
    }).populate('outletId', 'name image address phone');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details', details: error.message });
  }
});

module.exports = router;
