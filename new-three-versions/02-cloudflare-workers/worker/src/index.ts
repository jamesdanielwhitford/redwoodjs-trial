import { Env } from './types';
import { SessionDurableObject } from './durable-objects/SessionDurableObject';
import {
  handleCors,
  handleRegister,
  handleLogin,
  handleGetNotes,
  handleCreateNote,
  handleHealthCheck
} from './routes';

// Export Durable Object
export { SessionDurableObject };

// Request router
async function router(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight requests
  const corsResponse = handleCors(request);
  if (corsResponse) {
    return corsResponse;
  }

  // Route requests
  switch (path) {
    case '/api/health':
      return handleHealthCheck(request, env);
    
    case '/api/auth/register':
      if (request.method === 'POST') {
        return handleRegister(request, env);
      }
      break;
    
    case '/api/auth/login':
      if (request.method === 'POST') {
        return handleLogin(request, env);
      }
      break;
    
    case '/api/notes':
      if (request.method === 'GET') {
        return handleGetNotes(request, env);
      } else if (request.method === 'POST') {
        return handleCreateNote(request, env);
      }
      break;
    
    default:
      // 404 for unknown routes
      return new Response(
        JSON.stringify({ error: 'Route not found' }), 
        { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
  }

  // Method not allowed
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }), 
    { 
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

// Main Worker fetch handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await router(request, env);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }), 
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
  }
};