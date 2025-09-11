// RedwoodSDK API Route: /api/notes  
// Automatic CRUD operations with built-in authentication

import { requireAuth } from '../../lib/auth';
import { db } from '../../lib/db';

// GET /api/notes - Get all notes for authenticated user
export async function GET(request: Request) {
  try {
    // Built-in authentication - automatic token validation
    const user = await requireAuth(request);
    
    // Clean database query with type safety
    const notes = await db.note.findMany({
      where: { userId: user.id }
    });
    
    return Response.json({ notes });
    
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Failed to get notes' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

// POST /api/notes - Create new note
export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const { title, content } = await request.json();
    
    // Built-in validation helpers
    if (!title || !content) {
      return Response.json(
        { error: 'Title and content required' },
        { status: 400 }
      );
    }
    
    // Clean database operation
    const note = await db.note.create({
      userId: user.id,
      title: title.trim(),
      content: content.trim()
    });
    
    return Response.json({ note }, { status: 201 });
    
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Failed to create note' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete specific note
export async function DELETE(request: Request) {
  try {
    const user = await requireAuth(request);
    
    // RedwoodSDK provides clean URL parameter extraction
    const url = new URL(request.url);
    const noteId = parseInt(url.pathname.split('/').pop() || '');
    
    if (isNaN(noteId)) {
      return Response.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }
    
    // Built-in authorization - ensures user owns the note
    const deleted = await db.note.delete({
      where: { id: noteId, userId: user.id }
    });
    
    if (!deleted) {
      return Response.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      );
    }
    
    return Response.json({ message: 'Note deleted successfully' });
    
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Failed to delete note' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

/*
COMPARISON WITH VERSION 2 (Cloudflare Workers):

Version 2 Required 200+ lines of manual routing:
- Complex if/else routing logic
- Manual authentication for each endpoint
- Manual CORS for each response
- Manual error handling everywhere
- Manual request parsing
- Manual response formatting

RedwoodSDK Version: 70 lines of clean business logic!
- File-based routing (automatic endpoints)
- Built-in authentication middleware
- Automatic CORS handling
- Clean error responses  
- Type-safe database operations
- Framework handles infrastructure
- Focus only on business logic!
*/