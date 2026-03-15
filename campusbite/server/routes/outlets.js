const express = require('express');
const router = express.Router();
const { Outlet } = require('../models/Outlet');
const { MenuItem } = require('../models/MenuItem');

// Get all outlets
router.get('/', async (req, res) => {
  try {
    const outlets = await Outlet.find({ isOpen: true });
    res.json(outlets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch outlets', details: error.message });
  }
});

// Get single outlet by ID
router.get('/:id', async (req, res) => {
  try {
    const outlet = await Outlet.findById(req.params.id);
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    res.json(outlet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch outlet details', details: error.message });
  }
});

// Get menu items for an outlet
router.get('/:id/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ 
      outletId: req.params.id,
      isAvailable: true 
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items', details: error.message });
  }
});

module.exports = router;
