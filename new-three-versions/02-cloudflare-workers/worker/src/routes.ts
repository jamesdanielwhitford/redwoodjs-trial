import { 
  Env, 
  CreateUserRequest, 
  LoginRequest, 
  CreateNoteRequest, 
  AuthResponse 
} from './types';
import { Database } from './database';
import { 
  hashPassword, 
  verifyPassword, 
  createSession, 
  authenticateRequest 
} from './auth';

// CORS headers for development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight requests
export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  return null;
}

// Add CORS headers to response
function addCorsHeaders(response: Response): Response {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Helper function to create JSON responses
function jsonResponse(data: any, status = 200): Response {
  return addCorsHeaders(new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  }));
}

// Error response helper
function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}

// Register endpoint
export async function handleRegister(request: Request, env: Env): Promise<Response> {
  try {
    const body: CreateUserRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    const database = new Database(env);

    // Check if user already exists
    const existingUser = await database.findUserByEmail(email);
    if (existingUser) {
      return errorResponse('User already exists', 400);
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await database.createUser(email, passwordHash);

    // Create session
    const sessionId = await createSession(env, user.id, user.email);

    const response: AuthResponse = {
      token: sessionId,
      user: {
        id: user.id,
        email: user.email
      }
    };

    return jsonResponse(response, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Internal server error');
  }
}

// Login endpoint
export async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const database = new Database(env);

    // Find user
    const user = await database.findUserByEmail(email);
    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401);
    }

    // Create session
    const sessionId = await createSession(env, user.id, user.email);

    const response: AuthResponse = {
      token: sessionId,
      user: {
        id: user.id,
        email: user.email
      }
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error');
  }
}

// Get notes endpoint
export async function handleGetNotes(request: Request, env: Env): Promise<Response> {
  try {
    const session = await authenticateRequest(request, env);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const database = new Database(env);
    const notes = await database.getNotesByUserId(session.userId);

    return jsonResponse(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    return errorResponse('Internal server error');
  }
}

// Create note endpoint
export async function handleCreateNote(request: Request, env: Env): Promise<Response> {
  try {
    const session = await authenticateRequest(request, env);
    if (!session) {
      return errorResponse('Authentication required', 401);
    }

    const body: CreateNoteRequest = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return errorResponse('Title and content are required', 400);
    }

    const database = new Database(env);
    const note = await database.createNote(session.userId, title, content);

    return jsonResponse(note, 201);
  } catch (error) {
    console.error('Create note error:', error);
    return errorResponse('Internal server error');
  }
}

// Health check endpoint
export async function handleHealthCheck(request: Request, env: Env): Promise<Response> {
  try {
    const database = new Database(env);
    const isHealthy = await database.healthCheck();
    
    return jsonResponse({
      status: isHealthy ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      database: isHealthy ? 'connected' : 'disconnected'
    });
  } catch (error) {
    return jsonResponse({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, 500);
  }
}