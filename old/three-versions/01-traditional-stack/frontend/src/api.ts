// Simple API client for Traditional Stack demo
// This shows the manual complexity of handling auth and API calls

const API_BASE = '/api';

// Token management (localStorage - shows manual complexity)
export const getToken = (): string | null => localStorage.getItem('token');
export const setToken = (token: string): void => localStorage.setItem('token', token);
export const removeToken = (): void => localStorage.removeItem('token');

// API helper with manual JWT handling
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  // Manual error handling
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      removeToken();
      window.location.href = '/';
      return;
    }
    
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const login = async (email: string, password: string) => {
  const data = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (data.token) {
    setToken(data.token);
  }
  
  return data;
};

export const logout = () => {
  removeToken();
  window.location.href = '/';
};

// Notes API
export const getNotes = async () => {
  return apiRequest('/notes');
};

export const createNote = async (title: string, content: string) => {
  return apiRequest('/notes', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  });
};

export const deleteNote = async (noteId: number) => {
  return apiRequest(`/notes/${noteId}`, {
    method: 'DELETE',
  });
};