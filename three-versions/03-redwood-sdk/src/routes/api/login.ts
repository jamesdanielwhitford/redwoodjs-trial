// RedwoodSDK API Route: /api/login
// File-based routing - no manual Worker routing needed!

import { authenticateUser, createSession } from '../../lib/auth';

// RedwoodSDK automatically handles:
// - CORS headers
// - Request/response parsing
// - Error formatting
// - Type safety

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Built-in validation (RedwoodSDK provides helpers)
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Use built-in authentication
    const user = await authenticateUser(email, password);
    
    // Built-in session management
    const sessionToken = await createSession(user);
    
    return Response.json({
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email
      }
    });
    
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Authentication failed' },
      { status: 401 }
    );
  }
}

/*
COMPARISON WITH VERSION 2 (Cloudflare Workers):

Version 2 Required 80+ lines of manual routing:
- Manual URL pattern matching
- Manual CORS header management
- Manual request/response parsing  
- Manual error handling
- Manual authentication middleware
- Complex conditional logic

RedwoodSDK Version: 25 lines of business logic!
- File-based routing (no manual routing)
- Automatic CORS handling
- Built-in request/response helpers
- Clean error handling
- Framework handles all infrastructure
- Just focus on business logic!
*/