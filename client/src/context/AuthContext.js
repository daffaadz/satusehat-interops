"use client";

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { clearToken, getToken, setToken } from '../lib/authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setChecking(false);
      return null;
    }

    try {
      const response = await api.get('/v1/auth/me');
      const profile = response.data?.user ?? response.data;
      setUser(profile);
      setError(null);
      return profile;
    } catch (err) {
      clearToken();
      setUser(null);
      setError(err.message || 'Sesi berakhir');
      return null;
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/v1/auth/login', { username, password });
      const { token, user: profile } = response.data;
      setToken(token);
      setUser(profile);
      return response;
    } catch (err) {
      setError(err.message || 'Login gagal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/v1/auth/logout', {});
    } catch {
      // Token mungkin sudah invalid; tetap bersihkan sesi lokal
    } finally {
      clearToken();
      setUser(null);
      setError(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    checking,
    error,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
