const express = require('express');
const Joi = require('joi');
const { authenticate } = require('../middleware/auth');
const firebaseService = require('../services/firebaseService');

const router = express.Router();

// Validation schema
const searchVillageSchema = Joi.object({
  pinCode: Joi.string().length(6).pattern(/^\d{6}$/).required()
});

// Search villages by PIN code
router.get('/search', async (req, res) => {
  try {
    const { error, value } = searchVillageSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { pinCode } = value;

    // For now, return sample villages since we're using mock Firebase
    const sampleVillages = [
      {
        pinCode: pinCode,
        name: 'Test Village',
        state: 'Andhra Pradesh',
        district: 'Guntur',
        sarpanchId: 'test-sarpanch-id'
      }
    ];

    res.json({
      success: true,
      data: { villages: sampleVillages }
    });
  } catch (error) {
    console.error('Search villages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user's village info
router.get('/current', authenticate, async (req, res) => {
  try {
    console.log('Village current request - User:', req.user);
    
    // Create sample village data based on user info
    const village = {
      pinCode: req.user.pinCode || '522508',
      name: req.user.villageName || 'Test Village',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      users: [
        {
          id: 'test-user-id',
          name: 'Village Sarpanch',
          role: 'SARPANCH',
          createdAt: new Date().toISOString()
        },
        {
          id: 'test-villager-id',
          name: 'Test Villager',
          role: 'VILLAGER',
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      ]
    };

    res.json({
      success: true,
      data: { village }
    });
  } catch (error) {
    console.error('Get village info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get village statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    console.log('Village stats request - User:', req.user);
    
    // Return sample stats
    const stats = {
      totalUsers: 2,
      totalVillagers: 1,
      totalAlerts: 2,
      pendingSOSReports: 0,
      recentActivity: 5
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get village stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
