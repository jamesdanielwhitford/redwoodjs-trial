import React, { useState } from 'react';
import { apiClient } from '../api';

interface AuthFormProps {
  onSuccess: (token: string, user: { id: number; email: string }) => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = isLogin
        ? await apiClient.login(email, password)
        : await apiClient.register(email, password);
      
      onSuccess(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}