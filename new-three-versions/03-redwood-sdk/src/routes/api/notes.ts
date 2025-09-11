// RedwoodSDK API route - automatic routing based on file path
import { db } from '../../lib/db';
import { requireAuth } from '../../lib/auth';

export async function GET() {
  // RedwoodSDK automatically handles authentication middleware
  const user = await requireAuth();
  
  // Direct database query - no manual SQL needed
  const notes = await db.note.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return Response.json(notes);
}

export async function POST(request: Request) {
  const user = await requireAuth();
  const { title, content } = await request.json();

  if (!title || !content) {
    return Response.json({ error: 'Title and content required' }, { status: 400 });
  }

  try {
    const note = await db.note.create({
      data: {
        title,
        content,
        userId: user.id
      }
    });

    return Response.json(note, { status: 201 });
  } catch (error) {
    console.error('Create note error:', error);
    return Response.json({ error: 'Failed to create note' }, { status: 500 });
  }
}