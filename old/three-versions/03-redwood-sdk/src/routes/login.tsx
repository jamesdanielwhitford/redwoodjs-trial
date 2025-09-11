// RedwoodSDK Login Page - React Server Component
// File-based routing: /login

import { redirect } from '@redwoodjs/core';
import { getCurrentUser } from '../lib/auth';
import LoginForm from '../components/LoginForm';

// Server Component - runs on the server by default
export default async function LoginPage() {
  // Built-in authentication check
  const user = await getCurrentUser();
  
  // Automatic redirect if already logged in
  if (user) {
    redirect('/dashboard');
  }

  // Server-side rendering with client interactivity where needed
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Simple Notes</h1>
            <p className="text-sm text-gray-600 mt-2">RedwoodSDK Demo</p>
          </div>

          {/* Client Component for form interactivity */}
          <LoginForm />

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Test Credentials:</p>
            <p className="text-sm text-blue-700">Email: test@example.com</p>
            <p className="text-sm text-blue-700">Password: password123</p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              RedwoodSDK: Zero configuration setup!<br/>
              No manual routing, auth, or database setup required.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

/*
COMPARISON WITH PREVIOUS VERSIONS:

Version 1 (Traditional) & Version 2 (Workers):
- Manual client-side routing logic
- Manual authentication state management
- Manual redirect handling
- Client-side only rendering

RedwoodSDK Version: 
- Server Component by default (better performance)
- Built-in authentication helpers
- Automatic redirect handling
- File-based routing (no manual setup)
- Server-side rendering with selective client interactivity
- Clean, declarative code
*/