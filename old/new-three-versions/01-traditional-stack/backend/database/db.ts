import sqlite3 from 'sqlite3';
import path from 'path';
import { User, Note } from '../types';

class Database {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = path.join(__dirname, '../..', 'notes.db');
    this.db = new sqlite3.Database(dbPath);
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Create users table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }
        });

        // Create notes table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }

  async createUser(email: string, passwordHash: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, passwordHash],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          // Get the created user
          const userId = this.lastID;
          resolve({
            id: userId,
            email,
            password_hash: passwordHash,
            created_at: new Date().toISOString()
          });
        }
      );
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row || null);
        }
      );
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row || null);
        }
      );
    });
  }

  async createNote(userId: number, title: string, content: string): Promise<Note> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      this.db.run(
        'INSERT INTO notes (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [userId, title, content, now, now],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          resolve({
            id: this.lastID,
            user_id: userId,
            title,
            content,
            created_at: now,
            updated_at: now
          });
        }
      );
    });
  }

  async getNotesByUserId(userId: number): Promise<Note[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows || []);
        }
      );
    });
  }

  close(): void {
    this.db.close();
  }
}

export const database = new Database();