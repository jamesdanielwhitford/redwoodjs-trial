import { TaskCard } from "./TaskCard";

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

interface TaskColumnProps {
  status: string;
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskColumn({ status, tasks, onUpdateTask, onDeleteTask }: TaskColumnProps) {
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    
    // Find the task being dropped
    const draggedTask = document.querySelector(`[data-task-id="${taskId}"]`);
    if (draggedTask) {
      onUpdateTask(taskId, { status });
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div
      className="min-h-[200px] space-y-3"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {tasks.length === 0 ? (
        <div className="text-gray-500 text-center py-8 text-sm">
          No tasks yet
        </div>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))
      )}
    </div>
  );
}