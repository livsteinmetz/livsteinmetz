// src/auth.tsx
import React, { createContext, useContext, useState, useEffect, JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5174';

type AuthCtx = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  async function login(email: string, password: string) {
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem('authToken');
    setToken(null);
  }

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  const loc = useLocation();
  if (!token) return <Navigate to="/signin" state={{ from: loc }} replace />;
  return children;
}
