export interface Env {
  DB: D1Database;
  SESSIONS: DurableObjectNamespace;
}

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
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

export interface SessionData {
  userId: number;
  email: string;
  expiresAt: number;
}