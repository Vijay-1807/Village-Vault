const express = require('express');
const { authenticate } = require('../middleware/auth');
const firebaseService = require('../services/firebaseService');
const mediaService = require('../services/mediaService');
const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads (memory storage for Firebase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation schemas
const createMessageSchema = Joi.object({
  content: Joi.string().required().min(1).max(1000),
  type: Joi.string().valid('TEXT', 'IMAGE').default('TEXT'),
  villageId: Joi.string().required()
});

const updateMessageSchema = Joi.object({
  content: Joi.string().min(1).max(1000),
  isRead: Joi.boolean()
});

// Get all messages (public chat - everyone can view)
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('Messages route - Getting messages, user:', req.user);
    const limit = parseInt(req.query.limit) || 50;

    // Get real messages from Firestore
    const messages = await firebaseService.getMessages(limit);
    console.log('Messages route - Retrieved messages from Firestore:', messages.length);

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    // Return empty array if there's an error
    res.json({
      success: true,
      data: { messages: [] }
    });
  }
});

// Get message by ID (public - everyone can view)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const message = await firebaseService.getMessageById(id);

    res.json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }
});

// Create message (public chat - everyone can send)
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    let messageData = {
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      createdAt: new Date(),
      isRead: false
    };

    // Handle different message types
    if (req.file) {
      // Image message - upload to Firebase Storage
      try {
        // Upload to Cloudinary
        const imageUrl = await mediaService.uploadImage(req.file);

        messageData.type = 'IMAGE';
        messageData.imageUrl = imageUrl;
        messageData.content = 'Shared an image';
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image'
        });
      }
    } else {
      // Text message
      const { error, value } = createMessageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }
      messageData = { ...messageData, ...value };
    }

    // Save message to Firestore
    const message = await firebaseService.createMessage(messageData);
    console.log('New message created in Firestore:', message);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Update message (only sender can update their own messages)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateMessageSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if message exists
    const existingMessage = await firebaseService.getMessageById(id);
    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender or Sarpanch
    if (existingMessage.senderId !== req.user.id && req.user.role !== 'SARPANCH') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own messages'
      });
    }

    const message = await firebaseService.updateMessage(id, value);

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
});

// Clear all messages (only Sarpanch can clear)
router.delete('/clear', authenticate, async (req, res) => {
  try {
    // Check if user is Sarpanch
    if (req.user.role !== 'SARPANCH') {
      return res.status(403).json({
        success: false,
        message: 'Only Sarpanch can clear all messages'
      });
    }

    console.log('Sarpanch clearing all messages...');
    await firebaseService.clearAllMessages();
    res.json({
      success: true,
      message: 'All messages cleared by Sarpanch'
    });
  } catch (error) {
    console.error('Clear messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear messages'
    });
  }
});

// Delete message (only sender or Sarpanch can delete)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if message exists
    const existingMessage = await firebaseService.getMessageById(id);
    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender or Sarpanch
    if (existingMessage.senderId !== req.user.id && req.user.role !== 'SARPANCH') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await firebaseService.deleteMessage(id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

module.exports = router;