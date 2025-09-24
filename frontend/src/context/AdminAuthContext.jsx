import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_CONFIG } from '../config/api.js';
import storage from '../utils/storage.js';

const AdminAuthContext = createContext();

// Admin-specific axios instance
const adminApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true
});

// Add auth interceptor for admin token
adminApi.interceptors.request.use((config) => {
  const token = storage.getAdminToken();
  console.log('🔍 Admin Token Debug:', { token: token ? `${token.slice(0, 20)}...` : null });
  if (token && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Authorization header added to request');
  } else {
    console.log('❌ No token found, request will fail');
  }
  return config;
});

// Response interceptor for admin auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      storage.clearAdminAuth();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing admin token on mount
  useEffect(() => {
    const token = storage.getAdminToken();
    const savedUser = storage.getAdminUser();

    console.log('🔍 Token check on mount:', { hasToken: !!token, hasUser: !!savedUser });

    if (token && savedUser) {
      try {
        setUser(savedUser);
        setIsAuthenticated(true);
        console.log('✅ Admin authenticated from storage');
      } catch (error) {
        console.error('Error using saved admin user:', error);
        storage.clearAdminAuth();
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await adminApi.post('/admin/login', credentials);

      if (response.data.success) {
        const { token, user } = response.data.data;

        storage.setAdminAuth(token, user);

        setUser(user);
        setIsAuthenticated(true);

        toast.success('Admin girişi başarılı!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Giriş başarısız');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Giriş hatası oluştu';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    storage.clearAdminAuth();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Çıkış yapıldı');
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    adminApi // Export admin API instance
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;