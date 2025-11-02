const jwt = require('jsonwebtoken');
const firebaseService = require('../services/firebaseService');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - Token received:', token);
    console.log('Auth middleware - Request headers:', req.headers);

    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Check if it's a test user token (simple string)
    if (token === 'test-sarpanch-token') {
      console.log('Auth middleware - Test sarpanch token recognized');
      req.user = {
        id: 'test-user-id',
        name: 'Village Sarpanch',
        role: 'SARPANCH',
        phoneNumber: '7286973788',
        pinCode: '522508',
        villageName: 'Test Village',
        isVerified: true
      };
      console.log('Auth middleware - User set:', req.user);
      return next();
    }

    if (token === 'test-villager-token') {
      console.log('Auth middleware - Test villager token recognized');
      req.user = {
        id: 'test-user-id', // Match the frontend user ID
        name: 'Test Villager 1',
        role: 'VILLAGER',
        phoneNumber: '6305994096',
        pinCode: '522508',
        villageName: 'Test Village',
        villageId: 'test-village-id',
        isVerified: true
      };
      console.log('Auth middleware - User set:', req.user);
      return next();
    }

    // Regular JWT token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await firebaseService.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account not verified. Please verify your phone number.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // Flatten the roles array in case it's nested
    const flatRoles = roles.flat();
    console.log('Authorize middleware - Required roles:', flatRoles);
    console.log('Authorize middleware - User role:', req.user?.role);
    
    if (!req.user) {
      console.log('Authorize middleware - No user found');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Please authenticate first.' 
      });
    }

    if (!flatRoles.includes(req.user.role)) {
      console.log('Authorize middleware - Insufficient permissions');
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    console.log('Authorize middleware - Authorization successful');
    next();
  };
};

module.exports = { authenticate, authorize };
