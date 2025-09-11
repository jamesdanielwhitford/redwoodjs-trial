import { verifyToken } from '../utils/jwt.js';
import { userDb } from '../database/db.js';

// Socket.io authentication middleware
export async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await userDb.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user info to socket
    socket.user = user;
    socket.token = token;
    
    console.log(`Socket authenticated: ${user.username} (${socket.id})`);
    next();
    
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    
    if (error.message === 'Token expired') {
      return next(new Error('Token expired'));
    } else if (error.message === 'Invalid token') {
      return next(new Error('Invalid token'));
    } else {
      return next(new Error('Authentication failed'));
    }
  }
}

// Middleware to check if user can access a specific room/resource
export function requireRoomAccess(getRoomId) {
  return async (socket, data, callback, next) => {
    try {
      const roomId = typeof getRoomId === 'function' ? getRoomId(data) : getRoomId;
      
      // For this demo, we'll allow access to any room
      // In a real app, you might check permissions here
      
      socket.currentRoom = roomId;
      next();
      
    } catch (error) {
      console.error('Room access check error:', error.message);
      callback?.({ error: 'Access denied' });
    }
  };
}

// Rate limiting for socket events (simple implementation)
const socketRateLimits = new Map();

export function socketRateLimit({ windowMs = 60000, maxEvents = 100 } = {}) {
  return (socket, data, callback, next) => {
    const userId = socket.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, events] of socketRateLimits.entries()) {
      socketRateLimits.set(key, events.filter(timestamp => timestamp > windowStart));
      if (socketRateLimits.get(key).length === 0) {
        socketRateLimits.delete(key);
      }
    }
    
    // Check current user's events
    const userEvents = socketRateLimits.get(userId) || [];
    const recentEvents = userEvents.filter(timestamp => timestamp > windowStart);
    
    if (recentEvents.length >= maxEvents) {
      console.warn(`Rate limit exceeded for user ${socket.user.username}`);
      return callback?.({ error: 'Rate limit exceeded' });
    }
    
    // Add current event
    recentEvents.push(now);
    socketRateLimits.set(userId, recentEvents);
    
    next();
  };
}

// Logging middleware for socket events
export function socketLogger(eventName) {
  return (socket, data, callback, next) => {
    console.log(`Socket event [${eventName}] from ${socket.user.username}:`, {
      socketId: socket.id,
      userId: socket.user.id,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { data })
    });
    
    next();
  };
}

// Error handling middleware for socket events
export function socketErrorHandler(socket, callback) {
  return (error) => {
    console.error(`Socket error for ${socket.user.username}:`, error);
    
    callback?.({ 
      error: error.message || 'An error occurred',
      timestamp: new Date().toISOString()
    });
  };
}