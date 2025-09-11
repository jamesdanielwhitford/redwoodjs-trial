// Server Component - displays notes with delete functionality
import { Note } from '../lib/db';
import DeleteNoteButton from './DeleteNoteButton';

interface NotesListProps {
  notes: Note[];
}

export default function NotesList({ notes }: NotesListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No notes yet. Create your first note above!</p>
        <p className="text-sm text-gray-400 mt-2">
          This data was fetched on the server - no loading states needed!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Your Notes ({notes.length})
      </h2>
      
      {notes.map((note) => (
        <div key={note.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
            
            {/* Client Component for interactivity */}
            <DeleteNoteButton noteId={note.id} />
          </div>
          
          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{note.content}</p>
          
          <p className="text-xs text-gray-500">
            Created: {formatDate(note.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}

/*
COMPARISON WITH PREVIOUS VERSIONS:

Version 1 & 2:
- Client-side data fetching with loading states
- Manual API calls in useEffect
- Loading spinners and error handling
- Complex state management for CRUD operations

RedwoodSDK Version:
- Server Component receives data as props
- Data pre-fetched on server (no loading states!)
- Better performance (server-rendered)
- Selective client interactivity (delete buttons)
- Clean, simple component logic
*/