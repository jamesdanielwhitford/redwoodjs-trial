// RedwoodSDK session management (built-in with Durable Objects)
import { defineDurableSession } from 'rwsdk/auth';

export const sessions = defineDurableSession({
  // RedwoodSDK automatically configures Durable Objects for sessions
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  
  // Built-in security headers and CSRF protection
  secure: true,
  httpOnly: true,
  sameSite: 'strict'
});