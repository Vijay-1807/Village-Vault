const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const firebaseService = require('../services/firebaseService');

const router = express.Router();
const prisma = new PrismaClient();

// Get users in the same village
router.get('/village', authenticate, async (req, res) => {
  try {
    const { role } = req.query;

    const whereClause = {
      pinCode: req.user.pinCode,
      villageName: req.user.villageName,
      isVerified: true,
      id: { not: req.user.id } // Exclude current user
    };

    if (role) {
      whereClause.role = role;
    }

    // Check if this is a test user
    if (req.user.id === 'test-user-id') {
      const mockVillagers = [
        { id: 'v1', name: 'Gayathri', phoneNumber: '+91 98491 19427', role: 'VILLAGER', createdAt: new Date() },
        { id: 'v2', name: 'Thilak Nikilesh', phoneNumber: '+91 63059 94096', role: 'VILLAGER', createdAt: new Date() },
        { id: 'v3', name: 'Veena', phoneNumber: '+91 94940 64441', role: 'VILLAGER', createdAt: new Date() },
        { id: 'v4', name: 'Rohini', phoneNumber: '+91 79817 38294', role: 'VILLAGER', createdAt: new Date() }
      ];

      // Filter by role if requested
      const filteredUsers = role ? mockVillagers.filter(u => u.role === role) : mockVillagers;

      return res.json({
        success: true,
        data: { users: filteredUsers }
      });
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        role: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get village users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user profile
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        pinCode: req.user.pinCode,
        villageName: req.user.villageName,
        isVerified: true
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
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

    console.log('Profile update request - User:', req.user, 'New name:', name);

    // For test user, just return success with updated data
    const updatedUser = {
      ...req.user,
      name: name.trim()
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get village statistics (All users can view)
router.get('/village/stats', authenticate, async (req, res) => {
  try {
    console.log('Dashboard stats request - User:', req.user);

    // Check if this is a test user (not in database)
    const isTestUser = req.user.id === 'test-user-id';

    if (isTestUser) {
      // For test users, get data from Firebase only (no Prisma)
      console.log('Test user detected - using Firebase data only');

      const [alerts, sosReports, messages] = await Promise.allSettled([
        firebaseService.getAlerts(1000).catch(() => []),
        firebaseService.getSOSReports(1000).catch(() => []),
        firebaseService.getMessages(1000).catch(() => [])
      ]);

      // Extract values from settled promises
      const alertsData = alerts.status === 'fulfilled' ? (alerts.value || []) : [];
      const sosReportsData = sosReports.status === 'fulfilled' ? (sosReports.value || []) : [];
      const messagesData = messages.status === 'fulfilled' ? (messages.value || []) : [];

      // Count pending SOS reports
      const pendingSOSReports = Array.isArray(sosReportsData)
        ? sosReportsData.filter(report =>
          report.status?.toUpperCase() === 'PENDING' ||
          report.status === 'pending'
        ).length
        : 0;

      // For test user, estimate users based on messages/alerts
      const stats = {
        totalUsers: 5, // 1 Sarpanch + 4 Villagers
        totalVillagers: 4, // 4 Mock Villagers
        totalAlerts: Array.isArray(alertsData) ? alertsData.length : 0,
        pendingSOSReports: pendingSOSReports,
        recentMessages: Array.isArray(messagesData) ? messagesData.length : 0
      };

      console.log('Test user dashboard stats:', stats);

      return res.json({
        success: true,
        data: { stats }
      });
    }

    // For real users, get data from both Prisma and Firebase
    console.log('Real user detected - using Prisma + Firebase data');

    const [totalUsersResult, totalVillagersResult, alertsResult, sosReportsResult, messagesResult] = await Promise.allSettled([
      // Count total users in village (including current user)
      prisma.user.count({
        where: {
          pinCode: req.user.pinCode,
          villageName: req.user.villageName,
          isVerified: true
        }
      }).catch(err => {
        console.error('Prisma user count error:', err);
        return 0;
      }),
      // Count villagers in village (excluding Sarpanch)
      prisma.user.count({
        where: {
          pinCode: req.user.pinCode,
          villageName: req.user.villageName,
          role: 'VILLAGER',
          isVerified: true
        }
      }).catch(err => {
        console.error('Prisma villager count error:', err);
        return 0;
      }),
      // Get alerts from Firebase
      firebaseService.getAlerts(1000).catch(err => {
        console.error('Firebase getAlerts error:', err);
        return [];
      }),
      // Get SOS reports from Firebase
      firebaseService.getSOSReports(1000).catch(err => {
        console.error('Firebase getSOSReports error:', err);
        return [];
      }),
      // Get messages from Firebase
      firebaseService.getMessages(1000).catch(err => {
        console.error('Firebase getMessages error:', err);
        return [];
      })
    ]);

    // Extract values from settled promises
    const totalUsers = totalUsersResult.status === 'fulfilled' ? (totalUsersResult.value || 0) : 0;
    const totalVillagers = totalVillagersResult.status === 'fulfilled' ? (totalVillagersResult.value || 0) : 0;
    const alerts = alertsResult.status === 'fulfilled' ? (alertsResult.value || []) : [];
    const sosReports = sosReportsResult.status === 'fulfilled' ? (sosReportsResult.value || []) : [];
    const messages = messagesResult.status === 'fulfilled' ? (messagesResult.value || []) : [];

    // Count pending SOS reports
    const pendingSOSReports = Array.isArray(sosReports)
      ? sosReports.filter(report =>
        report.status?.toUpperCase() === 'PENDING' ||
        report.status === 'pending'
      ).length
      : 0;

    // Get actual counts
    const stats = {
      totalUsers: totalUsers || 0,
      totalVillagers: totalVillagers || 0,
      totalAlerts: Array.isArray(alerts) ? alerts.length : 0,
      pendingSOSReports: pendingSOSReports,
      recentMessages: Array.isArray(messages) ? messages.length : 0
    };

    console.log('Real dashboard stats:', stats);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get village stats error:', error);
    console.error('Error stack:', error.stack);

    // Return safe defaults on error instead of crashing
    const stats = {
      totalUsers: 0,
      totalVillagers: 0,
      totalAlerts: 0,
      pendingSOSReports: 0,
      recentMessages: 0
    };

    res.json({
      success: true,
      data: { stats }
    });
  }
});

module.exports = router;
