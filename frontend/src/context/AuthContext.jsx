import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Production'da Vercel Functions kullan
console.log('✅ Production: Vercel Functions API kullanılıyor');

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Profil getirme hatası:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (nickname, password, captchaToken) => {
    try {
      const response = await axios.post('/api/auth/login', { nickname, password, captchaToken });
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        toast.success('Giriş başarılı!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Giriş hatası';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      if (response.data.success) {
        const { token, user, recoveryCode } = response.data.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Recovery code'u göster
        toast.success('Kayıt başarılı!');
        return { success: true, recoveryCode };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Kayıt hatası';
      toast.error(message);
      return { success: false, message };
    }
  };

  const recoverPassword = async (recoveryData) => {
    try {
      const response = await axios.post('/api/auth/recover-password', recoveryData);
      if (response.data.success) {
        toast.success('Şifre sıfırlandı!');
        return { success: true, newRecoveryCode: response.data.data.newRecoveryCode };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Şifre kurtarma hatası';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Çıkış yapıldı');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      if (response.data.success) {
        await fetchProfile();
        toast.success('Profil güncellendi');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profil güncelleme hatası';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    recoverPassword,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin === 1
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};