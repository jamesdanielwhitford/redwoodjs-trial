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
      route("/notes", [
        async ({ request, ctx }) => {
          if (!ctx.user) {
            return new Response(JSON.stringify({ error: "Authentication required" }), {
              status: 401,
              headers: { "Content-Type": "application/json" }
            });
          }

          if (request.method === "GET") {
            const notes = await db.note.findMany({
              where: { userId: ctx.user.id },
              orderBy: { createdAt: "desc" }
            });
            return new Response(JSON.stringify(notes), {
              headers: { "Content-Type": "application/json" }
            });
          }

          if (request.method === "POST") {
            const { title, content } = await request.json();
            if (!title || !content) {
              return new Response(JSON.stringify({ error: "Title and content required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
              });
            }

            const note = await db.note.create({
              data: {
                title,
                content,
                userId: ctx.user.id
              }
            });

            return new Response(JSON.stringify(note), {
              status: 201,
              headers: { "Content-Type": "application/json" }
            });
          }

          return new Response("Method not allowed", { status: 405 });
        }
      ])
    ])
  ]),
]);
