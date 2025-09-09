// RedwoodSDK Home Page - React Server Component
// File-based routing: /

import { redirect } from '@redwoodjs/core';
import { getCurrentUser } from '../lib/auth';

export default async function HomePage() {
  // Built-in authentication check
  const user = await getCurrentUser();
  
  // Automatic redirect logic - no manual routing code needed
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}

/*
COMPARISON WITH PREVIOUS VERSIONS:

Version 1 (Traditional):
- Manual routing logic in frontend
- Client-side authentication checks
- Multiple components for route handling

Version 2 (Workers):
- Manual Worker routing code (~400 lines)
- Manual authentication state management
- Complex routing patterns

RedwoodSDK Version:
- File-based routing (zero configuration)
- Built-in authentication helpers
- Server Component with automatic redirects
- Clean, declarative routing
*/