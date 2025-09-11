"use client";

import { useState } from "react";
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

interface TaskCardProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskCard({ task, onUpdateTask, onDeleteTask }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('text/plain', task.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleEdit = (title: string, description: string) => {
    onUpdateTask(task.id, { title, description });
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdateTask(task.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDeleteTask(task.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusOptions = () => {
    return [
      { value: 'todo', label: 'To Do', color: 'bg-red-500' },
      { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
      { value: 'done', label: 'Done', color: 'bg-green-500' }
    ];
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <TaskForm
          initialTitle={task.title}
          initialDescription={task.description || ''}
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
          submitLabel="Update Task"
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-task-id={task.id}
    >
      <div className="p-4">
        {/* Task Header */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 flex-1 mr-2">
            {task.title}
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-blue-500 p-1"
              title="Edit task"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 p-1"
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Task Description */}
        {task.description && (
          <p className="text-sm text-gray-600 mb-3">
            {task.description}
          </p>
        )}

        {/* Status Selector */}
        <div className="mb-3">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs px-2 py-1 rounded border"
          >
            {getStatusOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Task Footer */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>@{task.user.username}</span>
          <span>{formatDate(task.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}