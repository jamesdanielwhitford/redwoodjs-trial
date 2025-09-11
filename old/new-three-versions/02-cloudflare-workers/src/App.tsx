import React from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user, isLoading, login, logout, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AuthForm onSuccess={login} />;
  }

  return <Dashboard user={user!} onLogout={logout} />;
}

export default App;