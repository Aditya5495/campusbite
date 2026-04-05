const express = require('express');
const { Outlet } = require('../models/Outlet');
const { MenuItem } = require('../models/MenuItem');
const { Order } = require('../models/Order');
const { authenticateAdmin, getOutletAdminAccess } = require('../middleware/adminAuth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// List outlets for scope picker (super_admin: all; outlet_admin: own outlet only)
router.get('/outlets', async (req, res) => {
  try {
    if (req.user.role === 'super_admin') {
      const outlets = await Outlet.find().sort({ name: 1 });
      return res.json({ outlets });
    }
    const outlet = await Outlet.findOne({ adminId: req.user._id });
    if (!outlet) {
      return res.status(403).json({ error: 'No outlet assigned to this admin' });
    }
    return res.json({ outlets: [outlet] });
  } catch (error) {
    console.error('List admin outlets error:', error);
    res.status(500).json({ error: 'Failed to list outlets' });
  }
});

// Get outlet admin's outlet details
router.get('/outlet', getOutletAdminAccess, async (req, res) => {
  try {
    res.json({
      outlet: req.outlet
    });
  } catch (error) {
    console.error('Get outlet error:', error);
    res.status(500).json({ error: 'Failed to get outlet details' });
  }
});

// Update outlet information
router.put('/outlet', getOutletAdminAccess, async (req, res) => {
  try {
    const { name, description, image, address, phone, email, prepTime, operatingHours, isOpen } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (image) updateData.image = image;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (prepTime) updateData.prepTime = prepTime;
    if (operatingHours) updateData.operatingHours = operatingHours;
    if (typeof isOpen === 'boolean') updateData.isOpen = isOpen;

    const outlet = await Outlet.findByIdAndUpdate(
      req.outletId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Outlet updated successfully',
      outlet
    });
  } catch (error) {
    console.error('Update outlet error:', error);
    res.status(500).json({ error: 'Failed to update outlet', details: error.message });
  }
});

// Get outlet's menu items
router.get('/menu-items', getOutletAdminAccess, async (req, res) => {
  try {
    const { category, isAvailable } = req.query;
    
    const filter = { outletId: req.outletId };
    if (category) filter.category = category;
    if (typeof isAvailable === 'boolean') filter.isAvailable = isAvailable;

    const menuItems = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    
    res.json({
      menuItems
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: 'Failed to get menu items' });
  }
});

// Add new menu item
router.post('/menu-items', getOutletAdminAccess, async (req, res) => {
  try {
    const { name, description, price, image, category, isVeg, prepTime, isAvailable, ingredients, allergens } = req.body;

    const menuItem = new MenuItem({
      outletId: req.outletId,
      name,
      description,
      price,
      image: image || '',
      category,
      isVeg: isVeg !== undefined ? isVeg : true,
      prepTime,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      ingredients: ingredients || [],
      allergens: allergens || []
    });

    await menuItem.save();

    // Update outlet's menu categories if new category
    const outlet = await Outlet.findById(req.outletId);
    if (!outlet.menuCategories.includes(category)) {
      outlet.menuCategories.push(category);
      await outlet.save();
    }

    res.status(201).json({
      message: 'Menu item added successfully',
      menuItem
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ error: 'Failed to add menu item', details: error.message });
  }
});

// Update menu item
router.put('/menu-items/:id', getOutletAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, isVeg, prepTime, isAvailable, ingredients, allergens } = req.body;

    const menuItem = await MenuItem.findOne({ _id: id, outletId: req.outletId });
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (image !== undefined) updateData.image = image;
    if (category) updateData.category = category;
    if (isVeg !== undefined) updateData.isVeg = isVeg;
    if (prepTime !== undefined) updateData.prepTime = prepTime;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (ingredients) updateData.ingredients = ingredients;
    if (allergens) updateData.allergens = allergens;

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Menu item updated successfully',
      menuItem: updatedMenuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item', details: error.message });
  }
});

// Delete menu item
router.delete('/menu-items/:id', getOutletAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findOne({ _id: id, outletId: req.outletId });
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await MenuItem.findByIdAndDelete(id);

    res.json({
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Get outlet's orders
router.get('/orders', getOutletAdminAccess, async (req, res) => {
  try {
    const { status, orderType, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const filter = { outletId: req.outletId };
    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;
    
    if (startDate || endDate) {
      filter.placedAt = {};
      if (startDate) filter.placedAt.$gte = new Date(startDate);
      if (endDate) filter.placedAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .populate('studentId', 'name email phone')
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
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Update order status
router.put('/orders/:id/status', getOutletAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const validStatuses = ['placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findOne({ _id: id, outletId: req.outletId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update status and timestamps
    order.status = status;
    
    const now = new Date();
    switch (status) {
      case 'accepted':
        order.acceptedAt = now;
        break;
      case 'preparing':
        order.startedPreparingAt = now;
        break;
      case 'ready':
        order.readyAt = now;
        break;
      case 'completed':
        order.completedAt = now;
        break;
      case 'cancelled':
        order.cancelledAt = now;
        if (cancellationReason) {
          order.cancellationReason = cancellationReason;
        }
        break;
    }

    await order.save();

    // TODO: Emit real-time update via Socket.io
    // req.io.emit('orderStatusUpdate', { orderId: order._id, status, outletId: order.outletId });

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status', details: error.message });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', getOutletAdminAccess, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.countDocuments({
      outletId: req.outletId,
      placedAt: { $gte: today }
    });

    const pendingOrders = await Order.countDocuments({
      outletId: req.outletId,
      status: { $in: ['placed', 'accepted', 'preparing'] }
    });

    const totalMenuItems = await MenuItem.countDocuments({
      outletId: req.outletId
    });

    const availableMenuItems = await MenuItem.countDocuments({
      outletId: req.outletId,
      isAvailable: true
    });

    const recentOrders = await Order.find({
      outletId: req.outletId
    })
    .populate('studentId', 'name')
    .sort({ placedAt: -1 })
    .limit(5);

    res.json({
      stats: {
        todayOrders,
        pendingOrders,
        totalMenuItems,
        availableMenuItems
      },
      recentOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

module.exports = router;
