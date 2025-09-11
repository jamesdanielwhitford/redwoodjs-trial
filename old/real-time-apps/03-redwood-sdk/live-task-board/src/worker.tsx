import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { setCommonHeaders } from "@/app/headers";
import { userRoutes } from "@/app/pages/user/routes";
import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";
import { type User, db, setupDb } from "@/db";
import { env } from "cloudflare:workers";
export { SessionDurableObject } from "./session/durableObject";

export type AppContext = {
  session: Session | null;
  user: User | null;
};

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request, headers }) => {
    await setupDb(env);
    setupSessionStore(env);

    try {
      ctx.session = await sessions.load(request);
    } catch (error) {
      if (error instanceof ErrorResponse && error.code === 401) {
        await sessions.remove(request, headers);
        headers.set("Location", "/user/login");

        return new Response(null, {
          status: 302,
          headers,
        });
      }

      throw error;
    }

    if (ctx.session?.userId) {
      ctx.user = await db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
      });
    }
  },
  render(Document, [
    route("/", Home),
    prefix("/user", userRoutes),
    prefix("/api", [
      // Task API routes
      route("/tasks", [
        async ({ request, ctx }) => {
          if (!ctx.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }
          
          if (request.method === "GET") {
            const tasks = await db.task.findMany({
              where: { userId: ctx.user.id },
              include: { user: true },
              orderBy: [
                { position: 'asc' },
                { createdAt: 'desc' }
              ]
            });
            return Response.json(tasks);
          }
          
          if (request.method === "POST") {
            const { title, description } = await request.json();
            
            if (!title || title.trim() === '') {
              return Response.json({ error: "Title is required" }, { status: 400 });
            }
            
            const task = await db.task.create({
              data: {
                title: title.trim(),
                description: description?.trim() || null,
                userId: ctx.user.id
              },
              include: { user: true }
            });
            
            // Trigger real-time update for this user
            await renderRealtimeClients("TaskBoardRealtime", ctx.user.id);
            
            return Response.json(task);
          }
          
          return Response.json({ error: "Method not allowed" }, { status: 405 });
        }
      ]),
      
      route("/tasks/:id", [
        async ({ request, ctx, params }) => {
          if (!ctx.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }
          
          const taskId = params.id;
          
          // Verify task ownership
          const existingTask = await db.task.findUnique({
            where: { id: taskId }
          });
          
          if (!existingTask) {
            return Response.json({ error: "Task not found" }, { status: 404 });
          }
          
          if (existingTask.userId !== ctx.user.id) {
            return Response.json({ error: "Access denied" }, { status: 403 });
          }
          
          if (request.method === "GET") {
            const task = await db.task.findUnique({
              where: { id: taskId },
              include: { user: true }
            });
            return Response.json(task);
          }
          
          if (request.method === "PUT") {
            const updates = await request.json();
            const allowedFields = ['title', 'description', 'status', 'position'];
            const filteredUpdates = Object.keys(updates)
              .filter(key => allowedFields.includes(key))
              .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
              }, {} as any);
            
            const task = await db.task.update({
              where: { id: taskId },
              data: filteredUpdates,
              include: { user: true }
            });
            
            // Trigger real-time update for this user
            await renderRealtimeClients("TaskBoardRealtime", ctx.user.id);
            
            return Response.json(task);
          }
          
          if (request.method === "DELETE") {
            await db.task.delete({
              where: { id: taskId }
            });
            
            // Trigger real-time update for this user
            await renderRealtimeClients("TaskBoardRealtime", ctx.user.id);
            
            return Response.json({ success: true });
          }
          
          return Response.json({ error: "Method not allowed" }, { status: 405 });
        }
      ])
    ])
  ]),
]);
