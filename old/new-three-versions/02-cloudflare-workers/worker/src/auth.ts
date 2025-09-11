import { Env, SessionData } from './types';

// Generate a cryptographically secure session ID
export async function generateSessionId(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hash password using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Create session using Durable Objects
export async function createSession(
  env: Env, 
  userId: number, 
  email: string
): Promise<string> {
  const sessionId = await generateSessionId();
  const sessionData: SessionData = {
    userId,
    email,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };

  // Get Durable Object instance
  const sessionDO = env.SESSIONS.get(env.SESSIONS.idFromName(sessionId));
  
  // Store session data
  const response = await sessionDO.fetch(
    `https://session.example.com/?sessionId=${sessionId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create session');
  }

  return sessionId;
}

// Get session from Durable Objects
export async function getSession(
  env: Env,
  sessionId: string
): Promise<SessionData | null> {
  try {
    const sessionDO = env.SESSIONS.get(env.SESSIONS.idFromName(sessionId));
    
    const response = await sessionDO.fetch(
      `https://session.example.com/?sessionId=${sessionId}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      return null;
    }

    const sessionData = await response.json() as SessionData;
    return sessionData;
  } catch (error) {
    return null;
  }
}

// Delete session
export async function deleteSession(
  env: Env,
  sessionId: string
): Promise<void> {
  const sessionDO = env.SESSIONS.get(env.SESSIONS.idFromName(sessionId));
  
  await sessionDO.fetch(
    `https://session.example.com/?sessionId=${sessionId}`,
    { method: 'DELETE' }
  );
}

// Extract session ID from Authorization header
export function extractSessionId(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7); // Remove 'Bearer ' prefix
}

// Middleware to authenticate requests
export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<SessionData | null> {
  const sessionId = extractSessionId(request);
  if (!sessionId) {
    return null;
  }

  const sessionData = await getSession(env, sessionId);
  return sessionData;
}