const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const firebaseService = require('../services/firebaseService');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createAlertSchema = Joi.object({
  title: Joi.string().required().min(1).max(200),
  message: Joi.string().required().min(1).max(1000),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY').required(),
  villageId: Joi.string().required(),
  channels: Joi.array().items(Joi.string().valid('IN_APP', 'SMS', 'MISSED_CALL')).default(['IN_APP']),
  isScheduled: Joi.boolean().default(false),
  scheduledAt: Joi.string().when('isScheduled', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  isRepeated: Joi.boolean().default(false),
  repeatInterval: Joi.string().valid('daily', 'weekly', 'monthly').default('daily')
});

const updateAlertSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  message: Joi.string().min(1).max(1000),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'),
  status: Joi.string().valid('ACTIVE', 'COMPLETED', 'ARCHIVED')
});

// Get all alerts (public - everyone can view)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const alerts = await firebaseService.getAlerts(limit);

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    // Return empty array if Firestore is not configured
    res.json({
      success: true,
      data: { alerts: [] }
    });
  }
});

// Get alert by ID (public - everyone can view)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await firebaseService.getAlertById(id);

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(404).json({
      success: false,
      message: 'Alert not found'
    });
  }
});

// Create alert (Sarpanch only)
router.post('/', authenticate, authorize(['SARPANCH']), async (req, res) => {
  try {
    console.log('Alert creation request body:', req.body);
    console.log('User making request:', req.user);

    const { error, value } = createAlertSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        details: error.details
      });
    }

    const alertData = {
      ...value,
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role
    };

    const alert = await firebaseService.createAlert(alertData);

    // Simulate delivery channels
    if (alertData.channels.includes('IN_APP')) {
      // Emit socket event for real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('newAlert', alert);
        console.log('socket event emitted');
      }
    }

    if (alertData.channels.includes('SMS')) {
      console.log(`[SIMULATION] Sending SMS to all villagers in ${alertData.villageId}: "${alertData.title}"`);
    }

    if (alertData.channels.includes('MISSED_CALL')) {
      console.log(`[SIMULATION] Initiating Missed Calls to all villagers in ${alertData.villageId}`);
    }

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert'
    });
  }
});

// Update alert (Sarpanch only)
router.put('/:id', authenticate, authorize(['SARPANCH']), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Alerts] Updating alert ${id} with data:`, req.body);

    const { error, value } = updateAlertSchema.validate(req.body);

    if (error) {
      console.warn('[Alerts] Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if alert exists
    const existingAlert = await firebaseService.getAlertById(id);
    if (!existingAlert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const alert = await firebaseService.updateAlert(id, value);
    console.log('[Alerts] Update successful:', alert);

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('[Alerts] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert'
    });
  }
});

// Delete alert (Sarpanch only)
router.delete('/:id', authenticate, authorize(['SARPANCH']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if alert exists
    const existingAlert = await firebaseService.getAlertById(id);
    if (!existingAlert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await firebaseService.deleteAlert(id);

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert'
    });
  }
});

module.exports = router;