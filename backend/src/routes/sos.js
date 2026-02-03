const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const firebaseService = require('../services/firebaseService');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createSOSSchema = Joi.object({
  type: Joi.string().valid('MEDICAL', 'SAFETY', 'FIRE', 'POLICE', 'OTHER').required(),
  description: Joi.string().required().min(1).max(1000),
  location: Joi.string().required().min(1).max(200),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY').default('HIGH'),
  villageId: Joi.string().required()
});

const updateSOSSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'),
  description: Joi.string().min(1).max(1000),
  location: Joi.string().min(1).max(200)
});

// Get all SOS reports (public - everyone can view)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sosReports = await firebaseService.getSOSReports(limit);

    res.json({
      success: true,
      data: { sosReports }
    });
  } catch (error) {
    console.error('Get SOS reports error:', error);
    // Return empty array if Firestore is not configured
    res.json({
      success: true,
      data: { sosReports: [] }
    });
  }
});

// Get SOS report by ID (public - everyone can view)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sosReport = await firebaseService.getSOSReportById(id);

    res.json({
      success: true,
      data: { sosReport }
    });
  } catch (error) {
    console.error('Get SOS report error:', error);
    res.status(404).json({
      success: false,
      message: 'SOS report not found'
    });
  }
});

// Create SOS report (anyone can create)
router.post('/', authenticate, async (req, res) => {
  try {
    const { error, value } = createSOSSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const sosData = {
      ...value,
      reporterId: req.user.id,
      reporterName: req.user.name,
      reporterPhone: req.user.phoneNumber,
      status: 'PENDING'
    };

    const sosReport = await firebaseService.createSOSReport(sosData);

    res.status(201).json({
      success: true,
      message: 'SOS report created successfully',
      data: { sosReport }
    });
  } catch (error) {
    console.error('Create SOS report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create SOS report'
    });
  }
});

// Update SOS report (Sarpanch only)
router.put('/:id', authenticate, authorize(['SARPANCH']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateSOSSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if SOS report exists
    const existingSOS = await firebaseService.getSOSReportById(id);
    if (!existingSOS) {
      return res.status(404).json({
        success: false,
        message: 'SOS report not found'
      });
    }

    const sosReport = await firebaseService.updateSOSReport(id, value);

    res.json({
      success: true,
      message: 'SOS report updated successfully',
      data: { sosReport }
    });
  } catch (error) {
    console.error('Update SOS report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SOS report'
    });
  }
});

// Update SOS status (Sarpanch only)
router.patch('/:id/status', authenticate, authorize(['SARPANCH']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['PENDING', 'ACKNOWLEDGED', 'RESOLVED', 'CANCELLED'];
    const uppercaseStatus = status.toUpperCase();

    if (!validStatuses.includes(uppercaseStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if SOS report exists
    const existingSOS = await firebaseService.getSOSReportById(id);
    if (!existingSOS) {
      return res.status(404).json({
        success: false,
        message: 'SOS report not found'
      });
    }

    const updateData = { status: uppercaseStatus };
    const sosReport = await firebaseService.updateSOSReport(id, updateData);

    // Emit socket event if available
    if (req.app.get('io')) {
      req.app.get('io').to(existingSOS.villageId).emit('sosStatusUpdate', {
        reportId: id,
        status: uppercaseStatus
      });
    }

    res.json({
      success: true,
      message: 'SOS status updated successfully',
      data: { sosReport }
    });
  } catch (error) {
    console.error('Update SOS status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SOS status'
    });
  }
});

// Delete SOS report (Sarpanch only)
router.delete('/:id', authenticate, authorize(['SARPANCH']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if SOS report exists
    const existingSOS = await firebaseService.getSOSReportById(id);
    if (!existingSOS) {
      return res.status(404).json({
        success: false,
        message: 'SOS report not found'
      });
    }

    await firebaseService.deleteSOSReport(id);

    res.json({
      success: true,
      message: 'SOS report deleted successfully'
    });
  } catch (error) {
    console.error('Delete SOS report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete SOS report'
    });
  }
});

module.exports = router;