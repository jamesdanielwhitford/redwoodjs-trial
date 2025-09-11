import { Env, User, Note } from './types';

export class Database {
  constructor(private env: Env) {}

  // User operations
  async createUser(email: string, passwordHash: string): Promise<User> {
    const result = await this.env.DB.prepare(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)'
    )
      .bind(email, passwordHash)
      .run();

    if (!result.success) {
      throw new Error('Failed to create user');
    }

    return {
      id: result.meta.last_row_id as number,
      email,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    )
      .bind(email)
      .first();

    return result as User | null;
  }

  async findUserById(id: number): Promise<User | null> {
    const result = await this.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    )
      .bind(id)
      .first();

    return result as User | null;
  }

  // Note operations
  async createNote(userId: number, title: string, content: string): Promise<Note> {
    const now = new Date().toISOString();
    
    const result = await this.env.DB.prepare(
      'INSERT INTO notes (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(userId, title, content, now, now)
      .run();

    if (!result.success) {
      throw new Error('Failed to create note');
    }

    return {
      id: result.meta.last_row_id as number,
      user_id: userId,
      title,
      content,
      created_at: now,
      updated_at: now
    };
  }

  async getNotesByUserId(userId: number): Promise<Note[]> {
    const result = await this.env.DB.prepare(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC'
    )
      .bind(userId)
      .all();

    return result.results as Note[];
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.env.DB.prepare('SELECT 1 as test').first();
      return result !== null;
    } catch (error) {
      return false;
    }
  }
}