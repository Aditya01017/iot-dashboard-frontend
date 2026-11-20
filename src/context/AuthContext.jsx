import { useState, useEffect } from 'react';
import authApi from '../api/auth.api';
import AuthContext from './auth-context';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  // when the app loads, if we already have a token, fetch our user info
  // so we know our role (admin or viewer) even after a page refresh
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const me = await authApi.getMe();
        setUser(me);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('could not load user', err);
        clearAuth();
      }
    };
    loadUser();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.user);
    setIsAuthenticated(true);
    return res;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    setUser(res.user);
    setIsAuthenticated(true);
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
