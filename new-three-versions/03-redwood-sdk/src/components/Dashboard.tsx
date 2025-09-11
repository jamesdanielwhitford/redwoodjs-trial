// RedwoodSDK Client Component for interactive features
'use client';

import { useState } from 'react';
import { useRouter } from 'rwsdk/navigation';

interface User {
  id: number;
  email: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

interface DashboardProps {
  user: User;
  initialNotes: Note[];
}

export default function Dashboard({ user, initialNotes }: DashboardProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const newNote = await response.json();
      setNotes(prev => [newNote, ...prev]);
      setTitle('');
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    // RedwoodSDK handles logout automatically
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Quick Notes</h1>
          <p>Welcome back, {user.email}!</p>
        </div>
        <button className="btn logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <form className="new-note-form" onSubmit={handleCreateNote}>
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

      <h2>Your Notes ({notes.length})</h2>
      
      {notes.length === 0 ? (
        <div className="notes-grid">
          <div className="note-card">
            <h3>No notes yet</h3>
            <p>Create your first note above!</p>
          </div>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note.id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="note-date">
                Created: {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logout-btn {
          width: auto;
        }

        .new-note-form {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }

        .form-group input, .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          font-family: inherit;
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: #3498db;
        }

        .btn {
          background: #3498db;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          width: 100%;
          transition: background-color 0.3s;
        }

        .btn:hover {
          background: #2980b9;
        }

        .btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .error {
          color: #e74c3c;
          margin-bottom: 15px;
          padding: 10px;
          background: #fdf2f2;
          border-radius: 4px;
          border: 1px solid #fecaca;
        }

        .notes-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .note-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .note-card h3 {
          margin-bottom: 10px;
          color: #2c3e50;
        }

        .note-card p {
          color: #666;
          margin-bottom: 10px;
        }

        .note-date {
          font-size: 12px;
          color: #999;
        }

        h2 {
          color: #2c3e50;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}