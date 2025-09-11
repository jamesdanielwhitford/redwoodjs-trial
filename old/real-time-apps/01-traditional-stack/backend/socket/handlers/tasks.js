import { taskDb } from '../../database/db.js';
import { socketRateLimit, socketLogger, socketErrorHandler } from '../middleware.js';
import { validateTask, validateTaskUpdate } from '../../utils/validation.js';

export function handleTaskEvents(socket, io) {
  
  // Create new task
  socket.on('create_task', socketRateLimit(), socketLogger('create_task'), async (data, callback) => {
    try {
      const { error, value } = validateTask(data);
      if (error) {
        return callback?.({ 
          error: 'Invalid task data', 
          details: error.details.map(d => d.message) 
        });
      }

      const taskData = { ...value, userId: socket.user.id };
      const task = await taskDb.create(taskData);
      const taskWithUser = await taskDb.findById(task.id);

      const boardId = socket.currentBoardId || 'main-board';
      
      // Broadcast to other users in the same board
      socket.to(boardId).emit('task_created', {
        task: taskWithUser,
        createdBy: socket.user.username,
        timestamp: new Date().toISOString()
      });

      callback?.({ 
        success: true, 
        task: taskWithUser,
        message: 'Task created successfully'
      });

    } catch (error) {
      socketErrorHandler(socket, callback)(error);
    }
  });

  // Update existing task
  socket.on('update_task', socketRateLimit(), socketLogger('update_task'), async (data, callback) => {
    try {
      const { id, ...updateData } = data;
      
      if (!id) {
        return callback?.({ error: 'Task ID is required' });
      }

      const { error, value } = validateTaskUpdate(updateData);
      if (error) {
        return callback?.({ 
          error: 'Invalid update data', 
          details: error.details.map(d => d.message) 
        });
      }

      // Check if task exists and user owns it
      const existingTask = await taskDb.findById(id);
      if (!existingTask) {
        return callback?.({ error: 'Task not found' });
      }

      if (existingTask.user_id !== socket.user.id) {
        return callback?.({ error: 'Access denied: You can only update your own tasks' });
      }

      const updatedTask = await taskDb.update(id, value, socket.user.id);
      const taskWithUser = await taskDb.findById(updatedTask.id);

      const boardId = socket.currentBoardId || 'main-board';
      
      // Broadcast to other users
      socket.to(boardId).emit('task_updated', {
        task: taskWithUser,
        updatedBy: socket.user.username,
        changes: value,
        timestamp: new Date().toISOString()
      });

      callback?.({ 
        success: true, 
        task: taskWithUser,
        message: 'Task updated successfully'
      });

    } catch (error) {
      socketErrorHandler(socket, callback)(error);
    }
  });

  // Delete task
  socket.on('delete_task', socketRateLimit(), socketLogger('delete_task'), async (data, callback) => {
    try {
      const { id } = data;
      
      if (!id) {
        return callback?.({ error: 'Task ID is required' });
      }

      const existingTask = await taskDb.findById(id);
      if (!existingTask) {
        return callback?.({ error: 'Task not found' });
      }

      if (existingTask.user_id !== socket.user.id) {
        return callback?.({ error: 'Access denied: You can only delete your own tasks' });
      }

      const deletedTask = await taskDb.delete(id, socket.user.id);

      const boardId = socket.currentBoardId || 'main-board';
      
      // Broadcast to other users
      socket.to(boardId).emit('task_deleted', {
        taskId: id,
        taskTitle: deletedTask.title,
        deletedBy: socket.user.username,
        timestamp: new Date().toISOString()
      });

      callback?.({ 
        success: true, 
        taskId: id,
        message: 'Task deleted successfully'
      });

    } catch (error) {
      socketErrorHandler(socket, callback)(error);
    }
  });

  // Reorder tasks
  socket.on('reorder_tasks', socketRateLimit(), socketLogger('reorder_tasks'), async (data, callback) => {
    try {
      const { tasks } = data;
      
      if (!tasks || !Array.isArray(tasks)) {
        return callback?.({ error: 'Tasks array is required' });
      }

      // Verify ownership of all tasks
      const taskIds = tasks.map(t => t.id);
      const existingTasks = await Promise.all(taskIds.map(id => taskDb.findById(id)));
      
      const invalidTasks = existingTasks.filter(task => 
        !task || task.user_id !== socket.user.id
      );

      if (invalidTasks.length > 0) {
        return callback?.({ error: 'Access denied: Some tasks do not belong to you' });
      }

      await taskDb.reorderTasks(tasks);

      const boardId = socket.currentBoardId || 'main-board';
      
      // Broadcast to other users
      socket.to(boardId).emit('tasks_reordered', {
        tasks: tasks,
        reorderedBy: socket.user.username,
        timestamp: new Date().toISOString()
      });

      callback?.({ 
        success: true, 
        reorderedTasks: tasks.length,
        message: 'Tasks reordered successfully'
      });

    } catch (error) {
      socketErrorHandler(socket, callback)(error);
    }
  });
}