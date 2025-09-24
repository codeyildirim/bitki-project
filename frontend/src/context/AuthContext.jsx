import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_CONFIG } from '../config/api.js';
import storage from '../utils/storage.js';

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
    console.log('🧹 AuthContext: Eski localStorage verileri temizleniyor');
    storage.cleanupOldKeys();
  }, []);

  // Initial state'i storage servisinden güvenli şekilde al
  const [user, setUser] = useState(() => {
    return storage.getUser();
  });

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    return storage.getToken();
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
      const storedToken = storage.getToken();
      const storedUser = storage.getUser();

      console.log('📦 AuthContext: storedToken:', storedToken);
      console.log('👤 AuthContext: storedUser:', storedUser);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        console.log('✅ AuthContext: Kullanıcı session restore edildi');
      } else {
        console.log('⚠️ AuthContext: Token veya user bulunamadı');
      }
    } catch (error) {
      console.error('❌ Profil getirme hatası:', error);
      console.log('🗑️ storage temizleniyor...');
      storage.clearAuth();
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

        // Token ve user bilgilerini storage servisi ile kaydet
        storage.setAuth(token, user);

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

        // Token ve user bilgilerini storage servisi ile kaydet
        storage.setAuth(token, user);

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
    console.log('🚪 AuthContext: Logout işlemi başlatıldı');

    // Storage'ı temizle
    storage.clearAuth();

    // State'leri temizle
    setToken(null);
    setUser(null);

    // Axios header'ını temizle
    delete axios.defaults.headers.common['Authorization'];

    toast.success('Çıkış yapıldı');
    console.log('✅ AuthContext: Logout tamamlandı');
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