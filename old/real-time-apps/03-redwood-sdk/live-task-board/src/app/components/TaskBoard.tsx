"use client";

import { useState, useEffect } from "react";
import { TaskColumn } from "./TaskColumn";
import { TaskForm } from "./TaskForm";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    username: string;
  };
};

type TasksByStatus = {
  todo: Task[];
  in_progress: Task[];
  done: Task[];
};

type User = {
  id: string;
  username: string;
};

interface TaskBoardProps {
  tasks: TasksByStatus;
  user: User;
}

export function TaskBoard({ tasks: initialTasks, user }: TaskBoardProps) {
  const [tasks, setTasks] = useState<TasksByStatus>(initialTasks);
  const [isCreating, setIsCreating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [isPolling, setIsPolling] = useState(true);

  // Simple polling mechanism to simulate real-time updates
  // In a full implementation, this would be replaced with WebSocket connections
  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
          const allTasks = await response.json();
          
          // Group tasks by status
          const groupedTasks = {
            todo: allTasks.filter((t: Task) => t.status === 'todo'),
            in_progress: allTasks.filter((t: Task) => t.status === 'in_progress'),
            done: allTasks.filter((t: Task) => t.status === 'done')
          };
          
          // Only update if tasks have actually changed
          if (JSON.stringify(groupedTasks) !== JSON.stringify(tasks)) {
            setTasks(groupedTasks);
            setLastUpdated(new Date().toISOString());
          }
        }
      } catch (error) {
        console.error('Failed to poll for updates:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [tasks, isPolling]);

  // Pause polling when user is actively creating/editing
  useEffect(() => {
    setIsPolling(!isCreating);
  }, [isCreating]);

  const createTask = async (title: string, description: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => ({
          ...prev,
          todo: [...prev.todo, newTask]
        }));
        setIsCreating(false);
        setLastUpdated(new Date().toISOString());
        // Polling will sync any changes from other tabs
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        
        // Update local state optimistically
        setTasks(prev => {
          const newTasks = { ...prev };
          
          // Remove task from old status
          Object.keys(newTasks).forEach(status => {
            newTasks[status as keyof TasksByStatus] = newTasks[status as keyof TasksByStatus].filter(
              task => task.id !== taskId
            );
          });
          
          // Add task to new status
          const targetStatus = updatedTask.status as keyof TasksByStatus;
          newTasks[targetStatus] = [...newTasks[targetStatus], updatedTask];
          
          return newTasks;
        });
        setLastUpdated(new Date().toISOString());
        // Polling will sync any changes from other tabs
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(prev => {
          const newTasks = { ...prev };
          Object.keys(newTasks).forEach(status => {
            newTasks[status as keyof TasksByStatus] = newTasks[status as keyof TasksByStatus].filter(
              task => task.id !== taskId
            );
          });
          return newTasks;
        });
        setLastUpdated(new Date().toISOString());
        // Polling will sync any changes from other tabs
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'done': return 'Done';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-red-100 border-red-300';
      case 'in_progress': return 'bg-yellow-100 border-yellow-300';
      case 'done': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div>
      {/* Live Updates Status Indicator */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600">
            {isPolling ? 'Live updates enabled' : 'Updates paused'}
          </span>
          <span className="text-xs text-gray-400">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
          <button
            onClick={() => setIsPolling(!isPolling)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {isPolling ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Add Task Button */}
      <div className="mb-6">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            + Add New Task
          </button>
        ) : (
          <TaskForm
            onSubmit={createTask}
            onCancel={() => setIsCreating(false)}
          />
        )}
      </div>

      {/* Task Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(tasks) as Array<keyof TasksByStatus>).map((status) => (
          <div
            key={status}
            className={`rounded-lg border-2 border-dashed p-4 ${getStatusColor(status)}`}
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {getStatusLabel(status)} ({tasks[status].length})
            </h2>
            
            <TaskColumn
              status={status}
              tasks={tasks[status]}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Task Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {tasks.todo.length}
            </div>
            <div className="text-sm text-gray-600">To Do</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.in_progress.length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tasks.done.length}
            </div>
            <div className="text-sm text-gray-600">Done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.todo.length + tasks.in_progress.length + tasks.done.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}