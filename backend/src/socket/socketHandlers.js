const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const setupSocketHandlers = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          role: true,
          isVerified: true
        }
      });

      if (!user || !user.isVerified) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room
    if (socket.userId) {
      socket.join(socket.userId);
    }

    // Handle joining village room
    socket.on('joinVillage', async () => {
      try {
        if (!socket.userId) return;

        const user = await prisma.user.findUnique({
          where: { id: socket.userId },
          select: {
            pinCode: true,
            villageName: true
          }
        });

        if (user) {
          const villageRoom = `${user.pinCode}-${user.villageName}`;
          socket.join(villageRoom);
          console.log(`User ${socket.userId} joined village room: ${villageRoom}`);
        }
      } catch (error) {
        console.error('Error joining village room:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.broadcast.to(data.conversationId).emit('userTyping', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    });

    // Handle message read receipts
    socket.on('messageRead', async (data) => {
      try {
        if (!socket.userId) return;

        await prisma.message.updateMany({
          where: {
            senderId: data.senderId,
            receiverId: socket.userId,
            isRead: false
          },
          data: { isRead: true }
        });

        // Notify sender that messages were read
        io.to(data.senderId).emit('messagesRead', {
          readerId: socket.userId,
          conversationId: data.conversationId
        });
      } catch (error) {
        console.error('Error updating message read status:', error);
      }
    });

    // Handle online status
    socket.on('setOnlineStatus', (isOnline) => {
      socket.broadcast.emit('userStatusChange', {
        userId: socket.userId,
        isOnline
      });
    });

    // Handle sending messages
    socket.on('sendMessage', (message) => {
      console.log('Message received via socket:', message);
      // Broadcast the message to all connected users in the village
      socket.broadcast.emit('newMessage', message);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      
      // Notify others that user went offline
      socket.broadcast.emit('userStatusChange', {
        userId: socket.userId,
        isOnline: false
      });
    });

    // Handle error
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

module.exports = { setupSocketHandlers };
