import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_CONFIG } from '../config/api.js';

const AdminAuthContext = createContext();

// Admin-specific axios instance
const adminApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true
});

// Add auth interceptor for admin token
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for admin auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin_user');
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
    const token = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('admin_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved admin user:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await adminApi.post('/api/admin/login', credentials);

      if (response.data.success) {
        const { token, user } = response.data.data;

        localStorage.setItem('adminToken', token);
        localStorage.setItem('admin_user', JSON.stringify(user));

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
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin_user');
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