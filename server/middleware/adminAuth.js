const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { Outlet } = require('../models/Outlet');

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (user.role !== 'outlet_admin' && user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const getOutletAdminAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'super_admin') {
      const headerId = req.header('X-Outlet-Id')?.trim();
      if (!headerId) {
        return res.status(400).json({
          error: 'Select an outlet',
          code: 'OUTLET_SCOPE_REQUIRED',
          message: 'Super admins must send X-Outlet-Id to scope admin actions to one outlet.',
        });
      }
      const outlet = await Outlet.findById(headerId);
      if (!outlet) {
        return res.status(400).json({ error: 'Invalid outlet id' });
      }
      req.outletId = outlet._id;
      req.outlet = outlet;
      return next();
    }

    // For outlet admins, find their outlet
    const outlet = await Outlet.findOne({ adminId: req.user._id });
    
    if (!outlet) {
      return res.status(403).json({ error: 'No outlet assigned to this admin' });
    }

    req.outletId = outlet._id;
    req.outlet = outlet;
    next();
  } catch (error) {
    console.error('Outlet access error:', error);
    res.status(500).json({ error: 'Failed to verify outlet access' });
  }
};

const validateOutletAccess = async (req, res, next) => {
  try {
    const { outletId } = req.params;
    
    // Super admins can access any outlet
    if (req.user.role === 'super_admin') {
      return next();
    }

    // For outlet admins, ensure they can only access their own outlet
    if (req.outletId.toString() !== outletId) {
      return res.status(403).json({ error: 'Access denied: You can only manage your own outlet' });
    }

    next();
  } catch (error) {
    console.error('Outlet validation error:', error);
    res.status(500).json({ error: 'Failed to validate outlet access' });
  }
};

module.exports = {
  authenticateAdmin,
  getOutletAdminAccess,
  validateOutletAccess
};
