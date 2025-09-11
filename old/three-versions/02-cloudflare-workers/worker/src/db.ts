// Database operations for D1 (Cloudflare's SQLite database)
// This shows the manual query writing required without an ORM

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
}

export class Database {
  constructor(private db: D1Database) {}

  // User operations
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first<User>();
    
    return result || null;
  }

  async createUser(email: string, passwordHash: string): Promise<User> {
    const result = await this.db.prepare(`
      INSERT INTO users (email, password_hash) 
      VALUES (?, ?) 
      RETURNING id, email, password_hash, created_at
    `).bind(email, passwordHash).first<User>();
    
    if (!result) {
      throw new Error('Failed to create user');
    }
    
    return result;
  }

  // Note operations
  async getNotesByUserId(userId: number): Promise<Note[]> {
    const result = await this.db.prepare(`
      SELECT id, user_id, title, content, created_at
      FROM notes 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).bind(userId).all<Note>();
    
    return result.results || [];
  }

  async createNote(userId: number, title: string, content: string): Promise<Note> {
    const result = await this.db.prepare(`
      INSERT INTO notes (user_id, title, content) 
      VALUES (?, ?, ?) 
      RETURNING id, user_id, title, content, created_at
    `).bind(userId, title, content).first<Note>();
    
    if (!result) {
      throw new Error('Failed to create note');
    }
    
    return result;
  }

  async deleteNote(noteId: number, userId: number): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM notes 
      WHERE id = ? AND user_id = ?
    `).bind(noteId, userId).run();
    
    return result.changes > 0;
  }

  async getNoteById(noteId: number, userId: number): Promise<Note | null> {
    const result = await this.db.prepare(`
      SELECT id, user_id, title, content, created_at
      FROM notes 
      WHERE id = ? AND user_id = ?
    `).bind(noteId, userId).first<Note>();
    
    return result || null;
  }
}