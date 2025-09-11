// RedwoodSDK Client Component for authentication
'use client';

import { useState } from 'react';
import { useRouter } from 'rwsdk/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // RedwoodSDK handles session cookies automatically
      router.refresh(); // Refresh the page to show authenticated state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          className="btn"
          disabled={isLoading}
        >
          {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
        </button>
        
        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            disabled={isLoading}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        
        .auth-form {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        
        .auth-form h2 {
          margin-bottom: 20px;
          text-align: center;
          color: #2c3e50;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          transition: border-color 0.3s;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #3498db;
        }
        
        .btn {
          background: #3498db;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          width: 100%;
          transition: background-color 0.3s;
        }
        
        .btn:hover {
          background: #2980b9;
        }
        
        .btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
        
        .error {
          color: #e74c3c;
          margin-bottom: 15px;
          text-align: center;
          padding: 10px;
          background: #fdf2f2;
          border-radius: 4px;
          border: 1px solid #fecaca;
        }
        
        .auth-switch {
          text-align: center;
          margin-top: 20px;
        }
        
        .auth-switch button {
          background: none;
          border: none;
          color: #3498db;
          cursor: pointer;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}