import React, { useState, useEffect } from 'react';
import { apiClient } from '../api';
import { Note, User } from '../types';
import { NoteForm } from './NoteForm';
import { NoteList } from './NoteList';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setError('');
      const fetchedNotes = await apiClient.getNotes();
      setNotes(fetchedNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteCreated = (newNote: Note) => {
    setNotes(prev => [newNote, ...prev]);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Quick Notes</h1>
          <p>Welcome back, {user.email}!</p>
        </div>
        <button className="btn" onClick={handleLogout} style={{ width: 'auto' }}>
          Logout
        </button>
      </div>

      <NoteForm onNoteCreated={handleNoteCreated} />

      {error && <div className="error">{error}</div>}

      {isLoading ? (
        <div className="loading">Loading your notes...</div>
      ) : (
        <>
          <h2>Your Notes ({notes.length})</h2>
          <NoteList notes={notes} />
        </>
      )}
    </div>
  );
}