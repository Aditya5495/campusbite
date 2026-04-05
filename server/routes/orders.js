const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');
const { MenuItem } = require('../models/MenuItem');
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

// Get student's complete order history (before /:id)
router.get('/student/history', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { studentId: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .populate('outletId', 'name image address phone')
      .sort({ placedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total
      }
    });
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

// Reorder from previous order (before /:id)
router.post('/reorder/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    const originalOrder = await Order.findOne({
      _id: orderId,
      studentId: req.user._id
    }).populate('outletId', 'name');

    if (!originalOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if menu items are still available and get current prices
    const reorderedItems = [];
    let totalAmount = 0;
    let maxPrepTime = 0;

    for (const item of originalOrder.items) {
      const menuItem = await MenuItem.findOne({
        _id: item.menuItemId,
        isAvailable: true
      });

      if (!menuItem) {
        return res.status(400).json({ 
          error: `Item "${item.name}" is no longer available` 
        });
      }

      reorderedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        customizations: item.customizations
      });

      totalAmount += menuItem.price * item.quantity;
      maxPrepTime = Math.max(maxPrepTime, menuItem.prepTime);
    }

    // Create new order
    const newOrder = new Order({
      studentId: req.user._id,
      outletId: originalOrder.outletId,
      items: reorderedItems,
      orderType: originalOrder.orderType,
      scheduledPickupTime: originalOrder.orderType === 'scheduled' 
        ? new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
        : undefined,
      totalAmount,
      estimatedPrepTime: maxPrepTime,
      status: 'placed',
      paymentStatus: 'paid',
      placedAt: new Date()
    });

    await newOrder.save();
    
    // Populate outlet details for response
    await newOrder.populate('outletId', 'name image address phone');

    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ error: 'Failed to place reorder', details: error.message });
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
