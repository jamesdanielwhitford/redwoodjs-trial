import { useState, useEffect } from 'react';
import { getNotes, createNote, deleteNote, logout } from './api';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  // Add note form
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setError('');
      const data = await getNotes();
      setNotes(data.notes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setCreating(true);
    setError('');

    try {
      const data = await createNote(newTitle.trim(), newContent.trim());
      setNotes([data.note, ...notes]);
      setNewTitle('');
      setNewContent('');
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create note');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Delete this note?')) return;

    try {
      await deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete note');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Simple Notes</h1>
              <p className="text-sm text-gray-600">Cloudflare Workers Demo</p>
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Add Note Button/Form */}
        <div className="mb-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              + Add Note
            </button>
          ) : (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Note</h3>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="input"
                    placeholder="Enter note title..."
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="input"
                    rows={4}
                    placeholder="Enter note content..."
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn btn-primary"
                  >
                    {creating ? 'Creating...' : 'Create Note'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setNewTitle('');
                      setNewContent('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No notes yet. Create your first note above!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="btn btn-danger text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{note.content}</p>
                <p className="text-xs text-gray-500">
                  Created: {formatDate(note.created_at)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Improvements Note */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Cloudflare Workers Improvements:</strong> No PostgreSQL setup required! 
            D1 database managed by Cloudflare, serverless scaling, global edge deployment.
            But still requires manual Worker routing code and Wrangler configuration.
          </p>
          <p className="text-sm text-green-700 mt-2">
            <strong>Next:</strong> See how RedwoodSDK eliminates the remaining complexity!
          </p>
        </div>
      </div>
    </div>
  );
}