import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('homeserve_user');
      return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('homeserve_user');
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      const savedToken = localStorage.getItem('homeserve_token');
      return savedToken && savedToken !== 'undefined' ? savedToken : null;
    } catch {
      localStorage.removeItem('homeserve_token');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.data) {
            const updated = { ...user, ...res.data.data };
            setUser(updated);
            localStorage.setItem('homeserve_user', JSON.stringify(updated));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success && res.data?.data) {
      const authData = res.data.data;
      const userObj = {
        id: authData.id,
        email: authData.email,
        fullName: authData.fullName,
        phone: authData.phone,
        role: authData.role,
        profileImageUrl: authData.profileImageUrl,
        isVerified: authData.isVerified,
        isOnline: authData.isOnline,
      };
      setToken(authData.token);
      setUser(userObj);
      localStorage.setItem('homeserve_token', authData.token);
      localStorage.setItem('homeserve_user', JSON.stringify(userObj));
      return userObj;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data?.success && res.data?.data) {
      const authData = res.data.data;
      const userObj = {
        id: authData.id,
        email: authData.email,
        fullName: authData.fullName,
        phone: authData.phone,
        role: authData.role,
        profileImageUrl: authData.profileImageUrl,
        isVerified: authData.isVerified,
        isOnline: authData.isOnline,
      };
      setToken(authData.token);
      setUser(userObj);
      localStorage.setItem('homeserve_token', authData.token);
      localStorage.setItem('homeserve_user', JSON.stringify(userObj));
      return userObj;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('homeserve_token');
    localStorage.removeItem('homeserve_user');
  };

  const updateUser = (fields) => {
    const updated = { ...user, ...fields };
    setUser(updated);
    localStorage.setItem('homeserve_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
