import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_CONFIG } from '../config/api.js';

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
  console.log('🚀 AuthContext: AuthProvider oluşturuldu');

  // Clear old localStorage data that might conflict with API
  useEffect(() => {
    const clearOldData = () => {
      try {
        // Remove old user data that might be from localStorage-only system
        const oldUsers = localStorage.getItem('users');
        if (oldUsers) {
          console.log('🧹 AuthContext: Eski users verisi temizleniyor');
          localStorage.removeItem('users');
        }

        // Clean up system logs that might be outdated
        const systemLogs = localStorage.getItem('systemLogs');
        if (systemLogs) {
          console.log('🧹 AuthContext: Eski system logs temizleniyor');
          localStorage.removeItem('systemLogs');
        }

        // Clean up user logs that might be outdated
        const userLogs = localStorage.getItem('userLogs');
        if (userLogs) {
          console.log('🧹 AuthContext: Eski user logs temizleniyor');
          localStorage.removeItem('userLogs');
        }

        // Force clear any remaining conflicting data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('user') || key.includes('admin') || key.includes('log')) &&
              key !== 'currentUser' && key !== 'token') {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach(key => {
          console.log('🧹 AuthContext: Ek veri temizleniyor:', key);
          localStorage.removeItem(key);
        });

        console.log('✅ AuthContext: localStorage kapsamlı temizlik tamamlandı');
      } catch (error) {
        console.error('❌ AuthContext: localStorage temizlik hatası:', error);
      }
    };

    clearOldData();
  }, []);

  // Initial state'i localStorage'dan güvenli şekilde al
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    console.log('🔄 AuthContext useEffect: token değişti:', token, 'user var mı:', !!user);
    if (token) {
      console.log('🔑 AuthContext: Authorization header ayarlanıyor');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Eğer user yoksa ve localStorage'dan da alamadıysak fetchProfile çağır
      if (!user) {
        console.log('📋 AuthContext: User yok - fetchProfile çağrılıyor');
        fetchProfile();
      } else {
        console.log('✅ AuthContext: User mevcut, loading false yapılıyor');
        setLoading(false);
      }
    } else {
      console.log('⚠️ AuthContext: Token yok, loading false yapılıyor');
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      console.log('🔄 AuthContext: fetchProfile başlatıldı');
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser');

      console.log('📦 AuthContext: storedToken:', storedToken);
      console.log('👤 AuthContext: storedUser:', storedUser);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('✅ AuthContext: Kullanıcı session\' restore edildi');
      } else {
        console.log('⚠️ AuthContext: Token veya user bulunamadı');
      }
    } catch (error) {
      console.error('❌ Profil getirme hatası:', error);
      console.log('🗑️ localStorage temizleniyor...');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (nickname, password, captchaToken) => {
    try {
      console.log('🔐 Login işlemi başlatıldı');

      // Backend API endpoint
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/login`, {
        nickname,
        password,
        captchaToken
      });

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Token ve user bilgilerini kaydet
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Axios header'ına token ekle
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // State güncelle
        setToken(token);
        setUser(user);

        toast.success('Giriş başarılı!');
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }

    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Giriş başarısız';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔧 Register işlemi başlatıldı');

      const { nickname, password, confirmPassword, city, captchaToken } = userData;

      // Backend API endpoint
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/register`, {
        nickname,
        password,
        confirmPassword,
        city,
        captchaToken
      });

      if (response.data.success) {
        const { token, user, recoveryCode } = response.data.data;

        // Token ve user bilgilerini kaydet
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Axios header'ına token ekle
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // State güncelle
        setToken(token);
        setUser(user);

        toast.success('Kayıt başarılı! Kurtarma kodunuz: ' + recoveryCode);
        return { success: true, recoveryCode };
      } else {
        throw new Error(response.data.message);
      }

    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Kayıt başarısız';
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
    // Mevcut kullanıcı bilgisi varsa logout logunu ekle
    if (user) {
      const userLogs = JSON.parse(localStorage.getItem('userLogs') || '[]');
      userLogs.unshift({
        id: Date.now(),
        action: 'LOGOUT',
        status: 'SUCCESS',
        admin_nickname: user.nickname,
        description: `${user.nickname} kullanıcısı çıkış yaptı`,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('userLogs', JSON.stringify(userLogs.slice(0, 100)));
    }

    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
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