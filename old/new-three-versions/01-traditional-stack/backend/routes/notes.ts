import express, { Response } from 'express';
import { database } from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { CreateNoteRequest, Note } from '../types';

const router = express.Router();

// Get all notes for authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response<Note[]>) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' } as any);
      return;
    }

    const notes = await database.getNotesByUserId(req.user.id);
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' } as any);
  }
});

// Create new note
router.post('/', authenticateToken, async (req: AuthRequest<{}, Note, CreateNoteRequest>, res: Response<Note>) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' } as any);
      return;
    }

    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' } as any);
      return;
    }

    const note = await database.createNote(req.user.id, title, content);
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' } as any);
  }
});

export default router;