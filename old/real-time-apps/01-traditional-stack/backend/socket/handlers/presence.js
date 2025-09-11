import { socketRateLimit, socketLogger } from '../middleware.js';

export function handlePresenceEvents(socket, io) {
  
  // User typing indicator
  socket.on('user_typing', socketRateLimit({ maxEvents: 60 }), socketLogger('user_typing'), (data, callback) => {
    try {
      const { taskId, isTyping } = data;
      const boardId = socket.currentBoardId || 'main-board';
      
      socket.to(boardId).emit('user_typing', {
        userId: socket.user.id,
        username: socket.user.username,
        taskId,
        isTyping,
        timestamp: new Date().toISOString()
      });

      callback?.({ success: true });

    } catch (error) {
      callback?.({ error: error.message });
    }
  });

  // User cursor movement (for collaborative editing)
  socket.on('cursor_move', socketRateLimit({ maxEvents: 120 }), (data) => {
    try {
      const { taskId, x, y } = data;
      const boardId = socket.currentBoardId || 'main-board';
      
      socket.to(boardId).emit('cursor_moved', {
        userId: socket.user.id,
        username: socket.user.username,
        taskId,
        position: { x, y },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Cursor move error:', error);
    }
  });

  // User focus on task
  socket.on('task_focus', socketRateLimit(), socketLogger('task_focus'), (data, callback) => {
    try {
      const { taskId } = data;
      const boardId = socket.currentBoardId || 'main-board';
      
      socket.to(boardId).emit('task_focused', {
        userId: socket.user.id,
        username: socket.user.username,
        taskId,
        timestamp: new Date().toISOString()
      });

      callback?.({ success: true });

    } catch (error) {
      callback?.({ error: error.message });
    }
  });

  // User blur from task
  socket.on('task_blur', socketRateLimit(), socketLogger('task_blur'), (data, callback) => {
    try {
      const { taskId } = data;
      const boardId = socket.currentBoardId || 'main-board';
      
      socket.to(boardId).emit('task_blurred', {
        userId: socket.user.id,
        username: socket.user.username,
        taskId,
        timestamp: new Date().toISOString()
      });

      callback?.({ success: true });

    } catch (error) {
      callback?.({ error: error.message });
    }
  });
}