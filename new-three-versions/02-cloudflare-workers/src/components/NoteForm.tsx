import React, { useState } from 'react';
import { apiClient } from '../api';
import { Note } from '../types';

interface NoteFormProps {
  onNoteCreated: (note: Note) => void;
}

export function NoteForm({ onNoteCreated }: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const note = await apiClient.createNote({ title, content });
      onNoteCreated(note);
      setTitle('');
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="new-note-form" onSubmit={handleSubmit}>
      <h3>Add New Note</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          required
          disabled={isLoading}
        />
      </div>
      
      <button
        type="submit"
        className="btn"
        disabled={isLoading || !title.trim() || !content.trim()}
      >
        {isLoading ? 'Creating...' : 'Add Note'}
      </button>
    </form>
  );
}