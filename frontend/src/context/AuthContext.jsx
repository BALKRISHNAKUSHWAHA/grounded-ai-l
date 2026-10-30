import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      authAPI
        .getProfile()
        .then((res) => {
          setUser(res.data.user || res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const data = res.data;
    const newToken = data.token || data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const userInfo = data.user || { email };
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
    return data;
  }, []);

  const register = useCallback(async (email, password, full_name) => {
    const res = await authAPI.register({ email, password, full_name });
    const data = res.data;
    const newToken = data.token || data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const userInfo = data.user || { email, full_name };
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
