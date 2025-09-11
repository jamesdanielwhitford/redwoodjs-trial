// RedwoodSDK provides built-in authentication helpers
import { sessions } from './session';

// Built-in passkey authentication (provided by RedwoodSDK)
export async function getCurrentUser() {
  const session = await sessions.get();
  if (!session?.userId) return null;
  
  // RedwoodSDK automatically handles user lookup
  return {
    id: session.userId,
    email: session.email
  };
}

// Authentication middleware (RedwoodSDK provides this)
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Response('Authentication required', { status: 401 });
  }
  return user;
}