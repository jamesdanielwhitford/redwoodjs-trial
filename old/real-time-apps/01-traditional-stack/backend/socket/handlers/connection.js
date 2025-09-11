import { socketRateLimit, socketLogger, socketErrorHandler } from '../middleware.js';

// Handle socket connection events
export function handleConnection(socket, io) {
  
  // Join task board room
  socket.on('join_board', socketRateLimit(), socketLogger('join_board'), async (data, callback) => {
    try {
      const boardId = data?.boardId || 'main-board'; // Default board for demo
      
      // Leave previous rooms (except socket's own room)
      const previousRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      previousRooms.forEach(room => {
        socket.leave(room);
        socket.to(room).emit('user_left', {
          userId: socket.user.id,
          username: socket.user.username,
          timestamp: new Date().toISOString()
        });
      });
      
      // Join the requested board room
      socket.join(boardId);
      socket.currentBoardId = boardId;
      
      // Notify other users in the board
      socket.to(boardId).emit('user_joined', {
        userId: socket.user.id,
        username: socket.user.username,
        timestamp: new Date().toISOString()
      });
      
      // Get current users in the room (approximate - Socket.io doesn't provide exact user list)
      const socketsInRoom = await io.in(boardId).allSockets();
      
      console.log(`User ${socket.user.username} joined board ${boardId}`);
      
      callback?.({ 
        success: true, 
        boardId,
        message: `Joined board ${boardId}`,
        usersInRoom: socketsInRoom.size
      });
      
    } catch (error) {
      socketErrorHandler(socket, callback)(error);
    }
  });
  
  // Leave task board room
  socket.on('leave_board', socketRateLimit(), socketLogger('leave_board'), async (data, callback) => {
    try {
      const boardId = data?.boardId || socket.currentBoardId || 'main-board';
      
      // Leave the room
      socket.leave(boardId);
      
      // Notify other users
      socket.to(boardId).emit('user_left', {
        userId: socket.user.id,
        username: socket.user.username,
        timestamp: new Date().toISOString()
      });
      
      console.log(`User ${socket.user.username} left board ${boardId}`);
      
      callback?.({ 
        success: true, 
        boardId,
        message: `Left board ${boardId}`
      });
      
    } catch (error) {
      socketErrorHandler(socket, callback)(error);
    }
  });
  
  // Get board statistics
  socket.on('get_board_stats', socketRateLimit(), socketLogger('get_board_stats'), async (data, callback) => {
    try {
      const boardId = data?.boardId || socket.currentBoardId || 'main-board';
      
      // Get sockets in room
      const socketsInRoom = await io.in(boardId).allSockets();
      
      // In a real app, you'd fetch actual task statistics from database
      const stats = {
        boardId,
        connectedUsers: socketsInRoom.size,
        timestamp: new Date().toISOString()
      };
      
      callback?.({ 
        success: true, 
        stats 
      });
      
    } catch (error) {
      socketErrorHandler(socket, callback)(error);
    }
  });
  
  // Handle ping/pong for connection health
  socket.on('ping', socketRateLimit({ maxEvents: 30 }), (callback) => {
    callback?.({ 
      pong: true, 
      serverTime: new Date().toISOString(),
      userId: socket.user.id
    });
  });
  
  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.user.username}:`, error);
  });
  
  // Handle connection close
  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected for ${socket.user.username}: ${reason}`);
    
    // Notify all rooms this user was in
    const userRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
    userRooms.forEach(room => {
      socket.to(room).emit('user_left', {
        userId: socket.user.id,
        username: socket.user.username,
        reason,
        timestamp: new Date().toISOString()
      });
    });
  });
}