'use client'; // Client Component for delete functionality

import { useState } from 'react';

interface DeleteNoteButtonProps {
  noteId: string;
}

export default function DeleteNoteButton({ noteId }: DeleteNoteButtonProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    setDeleting(true);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete note');
      }

      // Refresh page to update notes list
      window.location.reload();
      
    } catch (err: any) {
      alert(err.message || 'Failed to delete note');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
    >
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}

/*
COMPARISON WITH PREVIOUS VERSIONS:

Previous Versions:
- Complex state management for optimistic updates
- Manual error handling throughout components  
- Direct API calls scattered throughout

RedwoodSDK Version:
- Simple client component with 'use client' directive
- Clean API calls (framework handles auth)
- Server Components handle data by default
- Client components only for interactivity
- Framework optimizations for data updates
*/