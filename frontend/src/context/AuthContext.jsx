import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await authService.checkAuth();
      const { authenticated, user: userData } = response.data.data;
      setIsAuthenticated(authenticated);
      setUser(userData || null);
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, passwordConfirm) => {
    try {
      setError(null);
      const response = await authService.register(name, email, password, passwordConfirm);
      setUser(response.data.data);
      setIsAuthenticated(true);
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      setUser(response.data.data);
      setIsAuthenticated(true);
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
