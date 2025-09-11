export interface User {
  id: number;
  email: string;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
}