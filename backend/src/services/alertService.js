const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Global io instance - will be set from index.js
let ioInstance = null;

const setIOInstance = (io) => {
  ioInstance = io;
};

const sendAlert = async (alertId) => {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        village: {
          include: {
            users: {
              where: {
                isVerified: true,
                id: { not: alertId } // Use alertId instead of alert.senderId to avoid circular reference
              }
            }
          }
        }
      }
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    const users = alert.village.users;
    const deliveryPromises = [];

    for (const user of users) {
      // Create delivery records for each channel
      for (const channel of alert.channels) {
        const delivery = await prisma.alertDelivery.create({
          data: {
            alertId: alert.id,
            userId: user.id,
            channel,
            status: 'pending'
          }
        });

        deliveryPromises.push(
          sendAlertToUser(user, alert, channel, delivery.id)
        );
      }
    }

    // Execute all deliveries
    await Promise.allSettled(deliveryPromises);

    // Update alert status
    await prisma.alert.update({
      where: { id: alertId },
      data: { updatedAt: new Date() }
    });

  } catch (error) {
    console.error('Error sending alert:', error);
    throw error;
  }
};

const sendAlertToUser = async (user, alert, channel, deliveryId) => {
  try {
    switch (channel) {
      case 'IN_APP':
        await sendInAppNotification(user, alert, deliveryId);
        break;
      case 'SMS':
        await sendSMS(user, alert, deliveryId);
        break;
      case 'MISSED_CALL':
        await sendMissedCall(user, alert, deliveryId);
        break;
    }
  } catch (error) {
    console.error(`Error sending ${channel} to user ${user.id}:`, error);
    
    // Update delivery status to failed
    await prisma.alertDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

const sendInAppNotification = async (user, alert, deliveryId) => {
  try {
    // Send real-time notification via Socket.IO
    if (ioInstance) {
      ioInstance.to(user.id).emit('newAlert', {
        id: alert.id,
        title: alert.title,
        message: alert.message,
        priority: alert.priority,
        createdAt: alert.createdAt
      });
    }

    // Update delivery status
    await prisma.alertDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'delivered',
        sentAt: new Date(),
        deliveredAt: new Date()
      }
    });
  } catch (error) {
    throw error;
  }
};

const sendSMS = async (user, alert, deliveryId) => {
  try {
    // In production, use Twilio or similar SMS service
    const message = `VillageVault Alert: ${alert.title}\n\n${alert.message}\n\nPriority: ${alert.priority}`;
    
    // For demo purposes, just log the SMS
    console.log(`SMS to ${user.phoneNumber}: ${message}`);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update delivery status
    await prisma.alertDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'delivered',
        sentAt: new Date(),
        deliveredAt: new Date()
      }
    });
  } catch (error) {
    throw error;
  }
};

const sendMissedCall = async (user, alert, deliveryId) => {
  try {
    // In production, use Twilio to make a missed call
    console.log(`Missed call to ${user.phoneNumber} for alert: ${alert.title}`);
    
    // Simulate missed call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update delivery status
    await prisma.alertDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'delivered',
        sentAt: new Date(),
        deliveredAt: new Date()
      }
    });
  } catch (error) {
    throw error;
  }
};

// Schedule alert for future delivery
const scheduleAlert = async (alertId, scheduledAt) => {
  // In production, use a job queue like Bull or Agenda
  const delay = scheduledAt.getTime() - Date.now();
  
  if (delay > 0) {
    setTimeout(async () => {
      await sendAlert(alertId);
    }, delay);
  }
};

// Handle repeated alerts
const handleRepeatedAlert = async (alertId) => {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId }
    });

    if (!alert || !alert.isRepeated) {
      return;
    }

    // Send the alert
    await sendAlert(alertId);

    // Schedule next occurrence
    let nextRun = new Date();
    switch (alert.repeatInterval) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }

    await scheduleAlert(alertId, nextRun);
  } catch (error) {
    console.error('Error handling repeated alert:', error);
  }
};

module.exports = { 
  sendAlert, 
  scheduleAlert, 
  handleRepeatedAlert, 
  setIOInstance 
};
