import express from 'express';
import { taskDb } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTask, validateTaskUpdate, validateTaskReorder, validateQuery, validateId } from '../utils/validation.js';

const router = express.Router();

// Apply authentication to all task routes
router.use(authenticateToken);

// Get all tasks with filtering and pagination
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = validateQuery(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.details.map(d => d.message)
      });
    }

    const { page, limit, status, userId } = value;
    const offset = (page - 1) * limit;

    // Get tasks with filters
    const tasks = await taskDb.findAll({
      userId: userId || undefined,
      status,
      limit,
      offset
    });

    // Get total count for pagination
    const totalCount = await taskDb.count({
      userId: userId || undefined,
      status
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      code: 'FETCH_TASKS_ERROR'
    });
  }
});

// Get tasks grouped by status (for kanban board)
router.get('/board', async (req, res) => {
  try {
    const tasksByStatus = await taskDb.getTasksByStatus();
    
    // Format response for kanban board
    const board = {
      todo: [],
      in_progress: [],
      done: []
    };

    tasksByStatus.forEach(group => {
      if (group.tasks) {
        board[group.status] = group.tasks;
      }
    });

    res.json({
      board,
      stats: {
        todo: board.todo.length,
        in_progress: board.in_progress.length,
        done: board.done.length,
        total: board.todo.length + board.in_progress.length + board.done.length
      }
    });

  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({
      error: 'Failed to fetch task board',
      code: 'FETCH_BOARD_ERROR'
    });
  }
});

// Get single task by ID
router.get('/:id', async (req, res) => {
  try {
    // Validate ID parameter
    const { error, value } = validateId(req.params);
    if (error) {
      return res.status(400).json({
        error: 'Invalid task ID',
        details: error.details.map(d => d.message)
      });
    }

    const task = await taskDb.findById(value.id);
    
    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    res.json({ task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      error: 'Failed to fetch task',
      code: 'FETCH_TASK_ERROR'
    });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    // Validate task data
    const { error, value } = validateTask(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Invalid task data',
        details: error.details.map(d => d.message)
      });
    }

    // Create task with current user as owner
    const taskData = {
      ...value,
      userId: req.user.id
    };

    const task = await taskDb.create(taskData);
    
    // Get task with user info for response
    const taskWithUser = await taskDb.findById(task.id);

    res.status(201).json({
      message: 'Task created successfully',
      task: taskWithUser
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: 'Failed to create task',
      code: 'CREATE_TASK_ERROR'
    });
  }
});

// Update existing task
router.put('/:id', async (req, res) => {
  try {
    // Validate ID parameter
    const { error: idError, value: idValue } = validateId(req.params);
    if (idError) {
      return res.status(400).json({
        error: 'Invalid task ID',
        details: idError.details.map(d => d.message)
      });
    }

    // Validate update data
    const { error: updateError, value: updateValue } = validateTaskUpdate(req.body);
    if (updateError) {
      return res.status(400).json({
        error: 'Invalid update data',
        details: updateError.details.map(d => d.message)
      });
    }

    // Check if task exists and user owns it
    const existingTask = await taskDb.findById(idValue.id);
    if (!existingTask) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    if (existingTask.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied: You can only update your own tasks',
        code: 'TASK_ACCESS_DENIED'
      });
    }

    // Update task
    const updatedTask = await taskDb.update(idValue.id, updateValue, req.user.id);
    
    if (!updatedTask) {
      return res.status(404).json({
        error: 'Task not found or update failed',
        code: 'TASK_UPDATE_FAILED'
      });
    }

    // Get updated task with user info
    const taskWithUser = await taskDb.findById(updatedTask.id);

    res.json({
      message: 'Task updated successfully',
      task: taskWithUser
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      error: 'Failed to update task',
      code: 'UPDATE_TASK_ERROR'
    });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    // Validate ID parameter
    const { error, value } = validateId(req.params);
    if (error) {
      return res.status(400).json({
        error: 'Invalid task ID',
        details: error.details.map(d => d.message)
      });
    }

    // Check if task exists and user owns it
    const existingTask = await taskDb.findById(value.id);
    if (!existingTask) {
      return res.status(404).json({
        error: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    if (existingTask.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied: You can only delete your own tasks',
        code: 'TASK_ACCESS_DENIED'
      });
    }

    // Delete task
    const deletedTask = await taskDb.delete(value.id, req.user.id);
    
    if (!deletedTask) {
      return res.status(404).json({
        error: 'Task not found or deletion failed',
        code: 'TASK_DELETE_FAILED'
      });
    }

    res.json({
      message: 'Task deleted successfully',
      task: {
        id: deletedTask.id,
        title: deletedTask.title
      }
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      error: 'Failed to delete task',
      code: 'DELETE_TASK_ERROR'
    });
  }
});

// Reorder multiple tasks
router.patch('/reorder', async (req, res) => {
  try {
    // Validate reorder data
    const { error, value } = validateTaskReorder(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Invalid reorder data',
        details: error.details.map(d => d.message)
      });
    }

    // Verify all tasks belong to the current user
    const taskIds = value.tasks.map(t => t.id);
    const existingTasks = await Promise.all(
      taskIds.map(id => taskDb.findById(id))
    );

    // Check if all tasks exist and belong to user
    const invalidTasks = existingTasks.filter(task => 
      !task || task.user_id !== req.user.id
    );

    if (invalidTasks.length > 0) {
      return res.status(403).json({
        error: 'Access denied: Some tasks do not exist or do not belong to you',
        code: 'TASK_REORDER_ACCESS_DENIED'
      });
    }

    // Reorder tasks
    await taskDb.reorderTasks(value.tasks);

    res.json({
      message: 'Tasks reordered successfully',
      reorderedTasks: value.tasks.length
    });

  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({
      error: 'Failed to reorder tasks',
      code: 'REORDER_TASKS_ERROR'
    });
  }
});

export default router;