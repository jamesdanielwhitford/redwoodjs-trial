import { RequestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { TaskBoard } from "@/app/components/TaskBoard";

export async function Home({ ctx }: RequestInfo) {
  if (!ctx.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Live Task Board
          </h1>
          <p className="text-gray-600 mb-6">
            A real-time collaborative task management application
          </p>
          <a 
            href="/user/login" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login with Passkey
          </a>
        </div>
      </div>
    );
  }

  // Direct database access in Server Component!
  const tasks = await db.task.findMany({
    where: { userId: ctx.user.id },
    include: { user: true },
    orderBy: [
      { position: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  // Group tasks by status for kanban board
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done')
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Live Task Board
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {ctx.user.username}
              </span>
              <a 
                href="/user/logout" 
                className="text-red-600 hover:text-red-800"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <TaskBoard 
          tasks={tasksByStatus} 
          user={ctx.user}
        />
      </main>
    </div>
  );
}
