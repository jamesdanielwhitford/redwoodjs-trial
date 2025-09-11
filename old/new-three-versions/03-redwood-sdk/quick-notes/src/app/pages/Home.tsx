import { RequestInfo } from "rwsdk/worker";
import { NoteForm } from "../components/NoteForm";
import { NoteList } from "../components/NoteList";
import { db } from "@/db";

export async function Home({ ctx }: RequestInfo) {
  // If user is not logged in, show login prompt
  if (!ctx.user) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Quick Notes</h1>
        <p>Please log in to view your notes</p>
        <a href="/user/login" style={{ color: "#3498db", textDecoration: "underline" }}>
          Go to Login
        </a>
      </div>
    );
  }

  // Fetch user's notes (Server Component - runs on server!)
  const notes = await db.note.findMany({
    where: { userId: ctx.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ 
        background: "white", 
        padding: "20px", 
        borderRadius: "8px", 
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", 
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h1>Quick Notes</h1>
          <p>Welcome back, {ctx.user.username}!</p>
        </div>
        <a 
          href="/user/logout" 
          style={{
            background: "#3498db",
            color: "white",
            padding: "12px 24px",
            borderRadius: "4px",
            textDecoration: "none"
          }}
        >
          Logout
        </a>
      </div>

      <NoteForm />

      <h2>Your Notes ({notes.length})</h2>
      <NoteList notes={notes} />
    </div>
  );
}
