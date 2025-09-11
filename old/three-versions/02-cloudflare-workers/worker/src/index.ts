// Main Cloudflare Worker - demonstrates manual routing complexity
// This shows why frameworks like RedwoodSDK are valuable

import { Database } from './db';
import { hashPassword, verifyPassword, createJWT, verifyJWT, extractToken } from './auth';

// Environment interface for D1 database binding
export interface Env {
  DB: D1Database;
  FRONTEND_URL?: string;
}

// CORS helper function (manual implementation required)
function corsHeaders(origin: string = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// JSON response helper
function jsonResponse(data: any, status: number = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// Error response helper
function errorResponse(message: string, status: number = 400, headers: Record<string, string> = {}) {
  return jsonResponse({ error: message }, status, headers);
}

// Authentication middleware (manual implementation)
async function requireAuth(request: Request): Promise<{ userId: number; email: string } | Response> {
  const token = extractToken(request);
  
  if (!token) {
    return errorResponse('Access token required', 401);
  }

  try {
    const payload = await verifyJWT(token);
    return { userId: payload.userId, email: payload.email };
  } catch (error) {
    return errorResponse('Invalid or expired token', 403);
  }
}

// Manual routing function (no framework!)
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // CORS preflight handling
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(env.FRONTEND_URL),
      });
    }

    const db = new Database(env.DB);
    const corsHeadersObj = corsHeaders(env.FRONTEND_URL);

    try {
      // Manual route matching (complex compared to Express or frameworks)
      
      // POST /login
      if (method === 'POST' && path === '/login') {
        const body = await request.json() as { email: string; password: string };
        
        if (!body.email || !body.password) {
          return errorResponse('Email and password required', 400, corsHeadersObj);
        }

        const user = await db.getUserByEmail(body.email.toLowerCase());
        if (!user) {
          return errorResponse('Invalid credentials', 401, corsHeadersObj);
        }

        const passwordMatch = await verifyPassword(body.password, user.password_hash);
        if (!passwordMatch) {
          return errorResponse('Invalid credentials', 401, corsHeadersObj);
        }

        const token = await createJWT({
          userId: user.id,
          email: user.email
        });

        return jsonResponse({
          token,
          user: {
            id: user.id,
            email: user.email
          }
        }, 200, corsHeadersObj);
      }

      // GET /notes (protected route)
      if (method === 'GET' && path === '/notes') {
        const authResult = await requireAuth(request);
        
        if (authResult instanceof Response) {
          // Add CORS headers to error response
          authResult.headers.set('Access-Control-Allow-Origin', env.FRONTEND_URL || '*');
          return authResult;
        }

        const notes = await db.getNotesByUserId(authResult.userId);
        return jsonResponse({ notes }, 200, corsHeadersObj);
      }

      // POST /notes (protected route)
      if (method === 'POST' && path === '/notes') {
        const authResult = await requireAuth(request);
        
        if (authResult instanceof Response) {
          authResult.headers.set('Access-Control-Allow-Origin', env.FRONTEND_URL || '*');
          return authResult;
        }

        const body = await request.json() as { title: string; content: string };
        
        if (!body.title || !body.content) {
          return errorResponse('Title and content required', 400, corsHeadersObj);
        }

        const note = await db.createNote(
          authResult.userId,
          body.title.trim(),
          body.content.trim()
        );

        return jsonResponse({ note }, 201, corsHeadersObj);
      }

      // DELETE /notes/:id (protected route)
      if (method === 'DELETE' && path.startsWith('/notes/')) {
        const authResult = await requireAuth(request);
        
        if (authResult instanceof Response) {
          authResult.headers.set('Access-Control-Allow-Origin', env.FRONTEND_URL || '*');
          return authResult;
        }

        const noteIdStr = path.split('/')[2];
        const noteId = parseInt(noteIdStr);
        
        if (isNaN(noteId)) {
          return errorResponse('Invalid note ID', 400, corsHeadersObj);
        }

        const deleted = await db.deleteNote(noteId, authResult.userId);
        
        if (!deleted) {
          return errorResponse('Note not found or access denied', 404, corsHeadersObj);
        }

        return jsonResponse({ message: 'Note deleted successfully' }, 200, corsHeadersObj);
      }

      // Health check endpoint
      if (method === 'GET' && path === '/health') {
        return jsonResponse({
          status: 'OK',
          timestamp: new Date().toISOString(),
          worker: 'simple-notes-cloudflare'
        }, 200, corsHeadersObj);
      }

      // 404 handler
      return errorResponse(`Route not found: ${method} ${path}`, 404, corsHeadersObj);

    } catch (error: any) {
      console.error('Worker error:', error);
      return errorResponse(
        'Internal server error',
        500,
        corsHeadersObj
      );
    }
  },
};