const { db, auth, storage, admin } = require('../config/firebase');

// Temporary in-memory storage for messages (since we're in mock mode)
let tempMessages = [];

class FirebaseService {
  // User operations
  async createUser(userData) {
    try {
      const userRef = await db.collection('users').add({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: userRef.id, ...userData };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async getUserByPhoneNumber(phoneNumber) {
    try {
      const usersSnapshot = await db.collection('users')
        .where('phoneNumber', '==', phoneNumber)
        .get();
      
      if (usersSnapshot.empty) {
        return null;
      }
      
      const userDoc = usersSnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      throw new Error(`Failed to get user by phone number: ${error.message}`);
    }
  }

  async getUserById(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return null;
      }
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      throw new Error(`Failed to get user by ID: ${error.message}`);
    }
  }

  async updateUser(userId, updateData) {
    try {
      await db.collection('users').doc(userId).update({
        ...updateData,
        updatedAt: new Date()
      });
      return { id: userId, ...updateData };
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Village operations
  async createVillage(villageData) {
    try {
      const villageRef = await db.collection('villages').add({
        ...villageData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: villageRef.id, ...villageData };
    } catch (error) {
      throw new Error(`Failed to create village: ${error.message}`);
    }
  }

  async getVillageByPinCodeAndName(pinCode, name) {
    try {
      const villagesSnapshot = await db.collection('villages')
        .where('pinCode', '==', pinCode)
        .where('name', '==', name)
        .get();
      
      if (villagesSnapshot.empty) {
        return null;
      }
      
      const villageDoc = villagesSnapshot.docs[0];
      return { id: villageDoc.id, ...villageDoc.data() };
    } catch (error) {
      throw new Error(`Failed to get village: ${error.message}`);
    }
  }

  async getVillageById(villageId) {
    try {
      const villageDoc = await db.collection('villages').doc(villageId).get();
      if (!villageDoc.exists) {
        return null;
      }
      return { id: villageDoc.id, ...villageDoc.data() };
    } catch (error) {
      throw new Error(`Failed to get village: ${error.message}`);
    }
  }

  async getUsersByVillageAndRole(villageId, role) {
    try {
      const usersSnapshot = await db.collection('users')
        .where('villageId', '==', villageId)
        .where('role', '==', role)
        .get();
      
      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to get users by village and role: ${error.message}`);
    }
  }

  // Alert operations
  async createAlert(alertData) {
    try {
      const alertRef = await db.collection('alerts').add({
        ...alertData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: alertRef.id, ...alertData };
    } catch (error) {
      throw new Error(`Failed to create alert: ${error.message}`);
    }
  }

  async getAlerts(limit = 10) {
    try {
      const alertsSnapshot = await db.collection('alerts')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to get alerts: ${error.message}`);
    }
  }

  async getAlertById(alertId) {
    try {
      const alertDoc = await db.collection('alerts').doc(alertId).get();
      if (!alertDoc.exists) {
        throw new Error('Alert not found');
      }
      return { id: alertDoc.id, ...alertDoc.data() };
    } catch (error) {
      throw new Error(`Failed to get alert: ${error.message}`);
    }
  }

  async updateAlert(alertId, updateData) {
    try {
      await db.collection('alerts').doc(alertId).update({
        ...updateData,
        updatedAt: new Date()
      });
      return { id: alertId, ...updateData };
    } catch (error) {
      throw new Error(`Failed to update alert: ${error.message}`);
    }
  }

  async deleteAlert(alertId) {
    try {
      await db.collection('alerts').doc(alertId).delete();
      return { id: alertId };
    } catch (error) {
      throw new Error(`Failed to delete alert: ${error.message}`);
    }
  }

  // SOS Report operations
  async createSOSReport(sosData) {
    try {
      const sosRef = await db.collection('sosReports').add({
        ...sosData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: sosRef.id, ...sosData };
    } catch (error) {
      throw new Error(`Failed to create SOS report: ${error.message}`);
    }
  }

  async getSOSReports(limit = 10) {
    try {
      const sosSnapshot = await db.collection('sosReports')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return sosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to get SOS reports: ${error.message}`);
    }
  }

  async getSOSReportById(sosId) {
    try {
      const sosDoc = await db.collection('sosReports').doc(sosId).get();
      if (!sosDoc.exists) {
        throw new Error('SOS report not found');
      }
      return { id: sosDoc.id, ...sosDoc.data() };
    } catch (error) {
      throw new Error(`Failed to get SOS report: ${error.message}`);
    }
  }

  async updateSOSReport(sosId, updateData) {
    try {
      await db.collection('sosReports').doc(sosId).update({
        ...updateData,
        updatedAt: new Date()
      });
      return { id: sosId, ...updateData };
    } catch (error) {
      throw new Error(`Failed to update SOS report: ${error.message}`);
    }
  }

  async deleteSOSReport(sosId) {
    try {
      await db.collection('sosReports').doc(sosId).delete();
      return { id: sosId };
    } catch (error) {
      throw new Error(`Failed to delete SOS report: ${error.message}`);
    }
  }

  // Message operations (Public Chat)
  async createMessage(messageData) {
    try {
      const message = {
        id: `msg-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
        ...messageData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Try to save to real Firestore first
      try {
        const messageRef = await db.collection('messages').add({
          ...messageData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        const savedMessage = { id: messageRef.id, ...messageData, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() };
        console.log('Message created and saved to Firestore:', savedMessage);
        
        // Also add to temporary storage for fallback
        tempMessages.push(savedMessage); // Add to end to maintain chronological order
        return savedMessage;
      } catch (firestoreError) {
        console.log('Firestore save failed, using temp storage:', firestoreError.message);
        // Add to temporary storage as fallback
        tempMessages.push(message); // Add to end to maintain chronological order
        console.log('Message created and stored temporarily:', message);
        return message;
      }
    } catch (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }
  }

  async uploadImage(file, fileName) {
    try {
      console.log('Uploading image:', fileName, 'Size:', file.size, 'Type:', file.mimetype);
      
      const bucket = storage.bucket();
      const fileUpload = bucket.file(`messages/images/${fileName}`);
      
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          console.error('Error uploading image file:', error);
          reject(error);
        });

        stream.on('finish', async () => {
          try {
            console.log('Image upload stream finished, making public...');
            // Make the file publicly accessible
            await fileUpload.makePublic();
            
            // Get the public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
            console.log('Image uploaded successfully:', publicUrl);
            resolve(publicUrl);
          } catch (error) {
            console.error('Error making image file public:', error);
            reject(error);
          }
        });

        console.log('Starting image upload stream...');
        stream.end(file.buffer);
      });
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadAudio(file, fileName) {
    try {
      console.log('Uploading audio:', fileName, 'Size:', file.size, 'Type:', file.mimetype);
      
      const bucket = storage.bucket();
      const fileUpload = bucket.file(`messages/audio/${fileName}`);
      
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          console.error('Error uploading audio file:', error);
          reject(error);
        });

        stream.on('finish', async () => {
          try {
            console.log('Audio upload stream finished, making public...');
            // Make the file publicly accessible
            await fileUpload.makePublic();
            
            // Get the public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
            console.log('Audio uploaded successfully:', publicUrl);
            resolve(publicUrl);
          } catch (error) {
            console.error('Error making audio file public:', error);
            reject(error);
          }
        });

        console.log('Starting audio upload stream...');
        stream.end(file.buffer);
      });
    } catch (error) {
      console.error('Audio upload error:', error);
      throw new Error(`Failed to upload audio: ${error.message}`);
    }
  }

  async getMessages(limit = 50) {
    try {
      console.log('FirebaseService - Getting messages with limit:', limit);
      
      // Try to get messages from real Firestore first
      try {
        const messagesSnapshot = await db.collection('messages')
          .orderBy('createdAt', 'asc') // Oldest first
          .limit(limit)
          .get();
        
        console.log('FirebaseService - Real Firestore messages count:', messagesSnapshot.size);
        
        if (messagesSnapshot.size > 0) {
          const messages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('FirebaseService - Returning real Firestore messages:', messages.length);
          return messages;
        }
      } catch (firestoreError) {
        console.log('FirebaseService - Firestore error, falling back to temp storage:', firestoreError.message);
      }
      
      // Fallback to temporary storage if Firestore fails
      console.log('FirebaseService - Temp messages count:', tempMessages.length);
      const messages = tempMessages.slice(0, limit);
      console.log('FirebaseService - Returning temp messages:', messages.length);
      return messages;
    } catch (error) {
      console.error('FirebaseService - Error getting messages:', error);
      throw new Error(`Failed to get messages: ${error.message}`);
    }
  }

  async getMessageById(messageId) {
    try {
      const messageDoc = await db.collection('messages').doc(messageId).get();
      if (!messageDoc.exists) {
        throw new Error('Message not found');
      }
      return { id: messageDoc.id, ...messageDoc.data() };
    } catch (error) {
      throw new Error(`Failed to get message: ${error.message}`);
    }
  }

  async clearAllMessages() {
    try {
      // Try to clear from Firestore first
      try {
        const messagesSnapshot = await db.collection('messages').get();
        const batch = db.batch();
        
        messagesSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log('All messages cleared from Firestore');
      } catch (firestoreError) {
        console.log('Firestore clear failed:', firestoreError.message);
      }
      
      // Also clear temporary storage
      tempMessages = [];
      console.log('All messages cleared from temporary storage');
      return true;
    } catch (error) {
      throw new Error(`Failed to clear messages: ${error.message}`);
    }
  }

  async updateMessage(messageId, updateData) {
    try {
      await db.collection('messages').doc(messageId).update({
        ...updateData,
        updatedAt: new Date()
      });
      return { id: messageId, ...updateData };
    } catch (error) {
      throw new Error(`Failed to update message: ${error.message}`);
    }
  }

  async deleteMessage(messageId) {
    try {
      await db.collection('messages').doc(messageId).delete();
      return { id: messageId };
    } catch (error) {
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const [usersSnapshot, alertsSnapshot, messagesSnapshot, sosSnapshot] = await Promise.all([
        db.collection('users').get(),
        db.collection('alerts').get(),
        db.collection('messages').get(),
        db.collection('sosReports').get()
      ]);

      return {
        totalUsers: usersSnapshot.size,
        totalAlerts: alertsSnapshot.size,
        totalMessages: messagesSnapshot.size,
        totalSOSReports: sosSnapshot.size
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  }
}

module.exports = new FirebaseService();