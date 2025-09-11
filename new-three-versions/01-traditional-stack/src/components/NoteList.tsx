import React from 'react';
import { Note } from '../types';

interface NoteListProps {
  notes: Note[];
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="notes-grid">
        <div className="note-card">
          <h3>No notes yet</h3>
          <p>Create your first note above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <div key={note.id} className="note-card">
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <div className="note-date">
            Created: {new Date(note.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}