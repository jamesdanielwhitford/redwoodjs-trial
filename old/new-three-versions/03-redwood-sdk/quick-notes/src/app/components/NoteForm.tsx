"use client";

import { useState, useTransition } from "react";

export function NoteForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });

        if (!response.ok) {
          throw new Error("Failed to create note");
        }

        // Clear form and refresh page
        setTitle("");
        setContent("");
        setError("");
        window.location.reload(); // Simple refresh for now
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create note");
      }
    });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        marginBottom: "20px"
      }}
    >
      <h3>Add New Note</h3>
      
      {error && (
        <div style={{
          color: "#e74c3c",
          marginBottom: "15px",
          padding: "10px",
          background: "#fdf2f2",
          borderRadius: "4px",
          border: "1px solid #fecaca"
        }}>
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: "20px" }}>
        <label 
          htmlFor="title"
          style={{
            display: "block",
            marginBottom: "5px",
            fontWeight: "500",
            color: "#555"
          }}
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          required
          disabled={isPending}
          style={{
            width: "100%",
            padding: "12px",
            border: "2px solid #ddd",
            borderRadius: "4px",
            fontSize: "16px",
            boxSizing: "border-box"
          }}
        />
      </div>
      
      <div style={{ marginBottom: "20px" }}>
        <label 
          htmlFor="content"
          style={{
            display: "block",
            marginBottom: "5px",
            fontWeight: "500",
            color: "#555"
          }}
        >
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          required
          disabled={isPending}
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "12px",
            border: "2px solid #ddd",
            borderRadius: "4px",
            fontSize: "16px",
            resize: "vertical",
            fontFamily: "inherit",
            boxSizing: "border-box"
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={isPending || !title.trim() || !content.trim()}
        style={{
          background: isPending || !title.trim() || !content.trim() ? "#bdc3c7" : "#3498db",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "4px",
          cursor: isPending || !title.trim() || !content.trim() ? "not-allowed" : "pointer",
          fontSize: "16px",
          width: "100%",
          transition: "background-color 0.3s"
        }}
      >
        {isPending ? "Creating..." : "Add Note"}
      </button>
    </form>
  );
}