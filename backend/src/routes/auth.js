const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { authenticate } = require('../middleware/auth');
const firebaseService = require('../services/firebaseService');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  name: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('SARPANCH', 'VILLAGER').required(),
  pinCode: Joi.string().length(6).pattern(/^\d{6}$/).required(),
  villageName: Joi.string().min(2).max(100).required()
});

const loginSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/).required()
});

const verifyOTPSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required()
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Generate OTP (for demo purposes - in production, use SMS service)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { phoneNumber, name, role, pinCode, villageName } = value;

    // Check if user already exists
    const existingUser = await firebaseService.getUserByPhone(phoneNumber);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Check if village exists, if not create it
    let village = await firebaseService.getVillageByPinCode(pinCode);

    if (!village) {
      village = await firebaseService.createVillage({
        name: villageName,
        pinCode,
        district: 'Guntur', // Default district
        state: 'Andhra Pradesh' // Default state
      });
    }

    // Check if sarpanch already exists for this village
    if (role === 'SARPANCH') {
      const existingSarpanch = await firebaseService.getUsersByVillageAndRole(village.id, 'SARPANCH');
      if (existingSarpanch && existingSarpanch.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Sarpanch already exists for this village'
        });
      }
    }

    // Create user
    const user = await firebaseService.createUser({
      phoneNumber,
      name,
      role,
      villageId: village.id,
      villageName,
      pinCode,
      isVerified: false
    });

    // Generate and store OTP
    const otp = generateOTP();
    otpStore.set(phoneNumber, { otp, timestamp: Date.now() });

    // In production, send OTP via SMS
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your phone number.',
      data: {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
        villageId: user.villageId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { phoneNumber } = value;

    // Check if user exists
    const user = await firebaseService.getUserByPhone(phoneNumber);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    otpStore.set(phoneNumber, { otp, timestamp: Date.now() });

    // In production, send OTP via SMS
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent to your phone number',
      data: {
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { error, value } = verifyOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { phoneNumber, otp } = value;

    // Check if OTP exists and is valid
    const storedOTP = otpStore.get(phoneNumber);
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    // Check if OTP is expired (5 minutes)
    const isExpired = Date.now() - storedOTP.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Get user
    const user = await firebaseService.getUserByPhone(phoneNumber);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user verification status
    await firebaseService.updateUser(user.id, { isVerified: true });

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove OTP from store
    otpStore.delete(phoneNumber);

    // Get village information
    const village = await firebaseService.getVillageById(user.villageId);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          role: user.role,
          villageId: user.villageId,
          villageName: user.villageName,
          pinCode: user.pinCode,
          isVerified: true
        },
        village: village ? {
          id: village.id,
          name: village.name,
          pinCode: village.pinCode,
          district: village.district,
          state: village.state
        } : null
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await firebaseService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get village information
    const village = await firebaseService.getVillageById(user.villageId);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          role: user.role,
          villageId: user.villageId,
          villageName: user.villageName,
          pinCode: user.pinCode,
          isVerified: user.isVerified
        },
        village: village ? {
          id: village.id,
          name: village.name,
          pinCode: village.pinCode,
          district: village.district,
          state: village.state
        } : null
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long'
      });
    }

    const updatedUser = await firebaseService.updateUser(req.user.id, {
      name: name.trim()
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          phoneNumber: updatedUser.phoneNumber,
          name: updatedUser.name,
          role: updatedUser.role,
          villageId: updatedUser.villageId,
          villageName: updatedUser.villageName,
          pinCode: updatedUser.pinCode,
          isVerified: updatedUser.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;