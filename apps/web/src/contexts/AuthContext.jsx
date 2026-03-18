import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api.js';
import { toast } from 'sonner';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Load user from stored token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setInitialLoading(false);
        return;
      }
      try {
        const user = await api.get('/auth/me');
        setCurrentUser(user);
        setIsAdmin(user.role === 'admin');
      } catch {
        // Token invalid/expired – clear it
        localStorage.removeItem('auth_token');
      } finally {
        setInitialLoading(false);
      }
    };
    initAuth();
  }, []);

  const isAuthenticated = useCallback(() => !!currentUser, [currentUser]);

  /** Register new user */
  const signup = async ({ name, email, phone, password }) => {
    try {
      const data = await api.post('/auth/register', { name, email, phone, password });
      localStorage.setItem('auth_token', data.token);
      setCurrentUser(data.user);
      setIsAdmin(data.user.role === 'admin');
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /** Login */
  const login = async (identifier, password) => {
    try {
      const body = identifier.includes('@')
        ? { email: identifier, password }
        : { phone: identifier, password };
      const data = await api.post('/auth/login', body);
      localStorage.setItem('auth_token', data.token);
      setCurrentUser(data.user);
      setIsAdmin(data.user.role === 'admin');
      return { success: true, user: data.user, isAdmin: data.user.role === 'admin' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /** Admin login */
  const adminLogin = async (email, password) => {
    try {
      const data = await api.post('/auth/admin-login', { email, password });
      localStorage.setItem('auth_token', data.token);
      setCurrentUser(data.user);
      setIsAdmin(true);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /** Logout */
  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    setIsAdmin(false);
    toast.success('Logged out successfully');
    navigate('/', { replace: true });
  };

  /** Update profile */
  const updateProfile = async (updates) => {
    try {
      const user = await api.put('/auth/me', updates);
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser, isAdmin, initialLoading,
      isAuthenticated, signup, login, adminLogin, logout, updateProfile,
      setCurrentUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
