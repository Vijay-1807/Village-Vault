const admin = require('firebase-admin');

let db = null;
let auth = null;
let storage = null;
let isFirebaseInitialized = false;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to initialize with service account if available
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const serviceAccount = {
        type: "service_account",
        project_id: "villagevault-b9ac4",
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'villagevault-b9ac4',
        storageBucket: "villagevault-b9ac4.appspot.com"
      });

      db = admin.firestore();
      auth = admin.auth();
      storage = admin.storage();
      isFirebaseInitialized = true;
      console.log('✅ Firebase Admin SDK initialized with service account');
    } else {
      console.log('⚠️ Firebase credentials not found, running in mock mode');
      // Create mock objects for development
      db = {
        collection: (collectionName) => ({
          add: (data) => Promise.resolve({ id: 'mock-id' }),
          get: () => Promise.resolve({ docs: [], size: 0, empty: true }),
          doc: (docId) => ({
            get: () => Promise.resolve({ exists: false }),
            set: () => Promise.resolve(),
            update: () => Promise.resolve(),
            delete: () => Promise.resolve()
          }),
          where: (field, operator, value) => ({
            get: () => Promise.resolve({ docs: [], size: 0, empty: true }),
            orderBy: (orderField, direction) => ({
              limit: (limitCount) => ({
                get: () => Promise.resolve({ docs: [], size: 0, empty: true })
              }),
              get: () => Promise.resolve({ docs: [], size: 0, empty: true })
            })
          }),
          orderBy: (field, direction) => ({
            limit: (limitCount) => ({
              get: () => {
                console.log('Mock Firebase - orderBy().limit().get() called for collection:', collectionName, 'with limit:', limitCount);
                // Return sample data for different collections
                if (collectionName === 'alerts') {
                  const sampleAlerts = [
                    {
                      id: 'alert-1',
                      title: 'Village Meeting Tomorrow',
                      message: 'There will be a village meeting tomorrow at 10 AM in the community center. All villagers are requested to attend.',
                      priority: 'MEDIUM',
                      senderId: 'test-user-id',
                      senderName: 'Village Sarpanch',
                      senderRole: 'SARPANCH',
                      createdAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
                      deliveries: []
                    },
                    {
                      id: 'alert-2',
                      title: 'Water Supply Maintenance',
                      message: 'Water supply will be temporarily unavailable from 9 AM to 3 PM today due to maintenance work.',
                      priority: 'HIGH',
                      senderId: 'test-user-id',
                      senderName: 'Village Sarpanch',
                      senderRole: 'SARPANCH',
                      createdAt: { _seconds: Math.floor((Date.now() - 86400000) / 1000), _nanoseconds: 0 }, // 1 day ago
                      deliveries: []
                    }
                  ];
                  return Promise.resolve({
                    docs: sampleAlerts.map(alert => ({
                      id: alert.id,
                      data: () => alert
                    })),
                    size: sampleAlerts.length,
                    empty: false
                  });
                } else if (collectionName === 'messages') {
                  const sampleMessages = [
                    {
                      id: 'msg-1',
                      content: 'Hello everyone! How is everyone doing today?',
                      type: 'TEXT',
                      senderId: 'test-user-id',
                      senderName: 'Village Sarpanch',
                      senderRole: 'SARPANCH',
                      createdAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
                      isRead: false
                    },
                    {
                      id: 'msg-2',
                      content: 'Good morning! The weather is beautiful today.',
                      type: 'TEXT',
                      senderId: 'test-villager-id',
                      senderName: 'Test Villager',
                      senderRole: 'VILLAGER',
                      createdAt: { _seconds: Math.floor((Date.now() - 3600000) / 1000), _nanoseconds: 0 }, // 1 hour ago
                      isRead: false
                    }
                  ];
                  return Promise.resolve({
                    docs: sampleMessages.map(msg => ({
                      id: msg.id,
                      data: () => msg
                    })),
                    size: sampleMessages.length,
                    empty: false
                  });
                } else if (collectionName === 'sosReports') {
                  const sampleSOSReports = [
                    {
                      id: 'sos-1',
                      type: 'MEDICAL',
                      description: 'Need immediate medical assistance for elderly person',
                      location: 'House No. 15, Main Street',
                      priority: 'EMERGENCY',
                      status: 'PENDING',
                      reporterId: 'test-villager-id',
                      reporterName: 'Test Villager',
                      reporterPhone: '6305994096',
                      reporterPinCode: '522508',
                      reporterVillageName: 'Test Village',
                      createdAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 }
                    },
                    {
                      id: 'sos-2',
                      type: 'SAFETY',
                      description: 'Suspicious activity near the school',
                      location: 'Near Primary School',
                      priority: 'HIGH',
                      status: 'IN_PROGRESS',
                      reporterId: 'test-user-id',
                      reporterName: 'Village Sarpanch',
                      reporterPhone: '7286973788',
                      reporterPinCode: '522508',
                      reporterVillageName: 'Test Village',
                      createdAt: { _seconds: Math.floor((Date.now() - 1800000) / 1000), _nanoseconds: 0 } // 30 minutes ago
                    }
                  ];
                  return Promise.resolve({
                    docs: sampleSOSReports.map(sos => ({
                      id: sos.id,
                      data: () => sos
                    })),
                    size: sampleSOSReports.length,
                    empty: false
                  });
                }
                return Promise.resolve({ docs: [], size: 0, empty: true });
              }
            }),
            get: () => Promise.resolve({ docs: [], size: 0, empty: true })
          })
        })
      };

      // Mock admin object with firestore FieldValue
      admin = {
        firestore: {
          FieldValue: {
            serverTimestamp: () => ({ _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 })
          }
        }
      };

      auth = {
        createUser: () => Promise.resolve({ uid: 'mock-uid' }),
        getUser: () => Promise.resolve({ uid: 'mock-uid' })
      };
      storage = {
        bucket: () => ({
          file: (fileName) => ({
            createWriteStream: (options) => {
              console.log('Mock storage: Creating write stream for:', fileName, 'Options:', options);
              const chunks = [];
              return {
                on: (event, callback) => {
                  console.log('Mock storage: Stream event:', event);
                  if (event === 'error') {
                    console.log('Mock storage: Simulating no errors');
                    // Don't call callback for error event
                  } else if (event === 'finish') {
                    console.log('Mock storage: Simulating successful upload');
                    // Simulate successful upload
                    setTimeout(() => {
                      console.log('Mock storage: Calling finish callback');
                      callback();
                    }, 10);
                  }
                },
                end: (buffer) => {
                  chunks.push(buffer);
                  console.log('Mock storage: File uploaded, size:', buffer ? buffer.length : 0);
                  // Trigger finish event
                  setTimeout(() => {
                    console.log('Mock storage: Triggering finish event');
                  }, 5);
                }
              };
            },
            makePublic: () => {
              console.log('Mock storage: Making file public');
              return Promise.resolve();
            },
            name: fileName || 'mock-file.jpg'
          })
        })
      };
      isFirebaseInitialized = false;
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.log('⚠️ Running in mock mode due to Firebase error');
    // Create mock objects
    db = {
      collection: (collectionName) => ({
        add: (data) => Promise.resolve({ id: 'mock-id' }),
        get: () => Promise.resolve({ docs: [], size: 0, empty: true }),
        doc: (docId) => ({
          get: () => Promise.resolve({ exists: false }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
          delete: () => Promise.resolve()
        }),
        where: (field, operator, value) => ({
          get: () => Promise.resolve({ docs: [], size: 0, empty: true }),
          orderBy: (orderField, direction) => ({
            limit: (limitCount) => ({
              get: () => Promise.resolve({ docs: [], size: 0, empty: true })
            }),
            get: () => Promise.resolve({ docs: [], size: 0, empty: true })
          })
        }),
        orderBy: (field, direction) => ({
          limit: (limitCount) => ({
            get: () => {
              // Return sample data for different collections
              if (collectionName === 'alerts') {
                const sampleAlerts = [
                  {
                    id: 'alert-1',
                    title: 'Village Meeting Tomorrow',
                    message: 'There will be a village meeting tomorrow at 10 AM in the community center. All villagers are requested to attend.',
                    priority: 'MEDIUM',
                    senderId: 'test-user-id',
                    senderName: 'Village Sarpanch',
                    senderRole: 'SARPANCH',
                    createdAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
                    deliveries: []
                  },
                  {
                    id: 'alert-2',
                    title: 'Water Supply Maintenance',
                    message: 'Water supply will be temporarily unavailable from 9 AM to 3 PM today due to maintenance work.',
                    priority: 'HIGH',
                    senderId: 'test-user-id',
                    senderName: 'Village Sarpanch',
                    senderRole: 'SARPANCH',
                    createdAt: { _seconds: Math.floor((Date.now() - 86400000) / 1000), _nanoseconds: 0 }, // 1 day ago
                    deliveries: []
                  }
                ];
                return Promise.resolve({
                  docs: sampleAlerts.map(alert => ({
                    id: alert.id,
                    data: () => alert
                  })),
                  size: sampleAlerts.length,
                  empty: false
                });
              } else if (collectionName === 'messages') {
                const sampleMessages = [
                  {
                    id: 'msg-1',
                    content: 'Hello everyone! How is everyone doing today?',
                    type: 'TEXT',
                    senderId: 'test-user-id',
                    senderName: 'Village Sarpanch',
                    senderRole: 'SARPANCH',
                    createdAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
                    isRead: false
                  },
                  {
                    id: 'msg-2',
                    content: 'Good morning! The weather is beautiful today.',
                    type: 'TEXT',
                    senderId: 'test-villager-id',
                    senderName: 'Test Villager',
                    senderRole: 'VILLAGER',
                    createdAt: { _seconds: Math.floor((Date.now() - 3600000) / 1000), _nanoseconds: 0 }, // 1 hour ago
                    isRead: false
                  }
                ];
                return Promise.resolve({
                  docs: sampleMessages.map(msg => ({
                    id: msg.id,
                    data: () => msg
                  })),
                  size: sampleMessages.length,
                  empty: false
                });
              }
              return Promise.resolve({ docs: [], size: 0, empty: true });
            }
          }),
          get: () => Promise.resolve({ docs: [], size: 0, empty: true })
        })
      })
    };

    // Mock admin object with firestore FieldValue
    admin = {
      firestore: {
        FieldValue: {
          serverTimestamp: () => ({ _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 })
        }
      }
    };

    auth = {
      createUser: () => Promise.resolve({ uid: 'mock-uid' }),
      getUser: () => Promise.resolve({ uid: 'mock-uid' })
    };
    storage = {
      bucket: () => ({
        file: (fileName) => ({
          createWriteStream: (options) => {
            console.log('Mock storage (catch): Creating write stream for:', fileName, 'Options:', options);
            const chunks = [];
            return {
              on: (event, callback) => {
                console.log('Mock storage (catch): Stream event:', event);
                if (event === 'error') {
                  console.log('Mock storage (catch): Simulating no errors');
                  // Don't call callback for error event
                } else if (event === 'finish') {
                  console.log('Mock storage (catch): Simulating successful upload');
                  // Simulate successful upload
                  setTimeout(() => {
                    console.log('Mock storage (catch): Calling finish callback');
                    callback();
                  }, 10);
                }
              },
              end: (buffer) => {
                chunks.push(buffer);
                console.log('Mock storage (catch): File uploaded, size:', buffer ? buffer.length : 0);
                // Trigger finish event
                setTimeout(() => {
                  console.log('Mock storage (catch): Triggering finish event');
                }, 5);
              }
            };
          },
          makePublic: () => {
            console.log('Mock storage (catch): Making file public');
            return Promise.resolve();
          },
          name: fileName || 'mock-file.jpg'
        })
      })
    };
    isFirebaseInitialized = false;
  }
}

module.exports = {
  admin,
  db,
  auth,
  storage,
  isFirebaseInitialized
};