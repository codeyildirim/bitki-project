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
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Profil getirme hatası:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  };

  const login = async (nickname, password, captchaToken) => {
    try {
      // Geçici çözüm: Local storage tabanlı giriş
      console.log('🔐 Local storage tabanlı giriş işlemi');

      // Validasyon
      if (!nickname || !password) {
        throw new Error('Kullanıcı adı ve şifre gerekli');
      }

      // Local storage'dan kullanıcıları al
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

      // Kullanıcıyı bul
      const user = existingUsers.find(u => u.nickname === nickname && u.password === password);
      if (!user) {
        throw new Error('Kullanıcı adı veya şifre hatalı');
      }

      // Mock token oluştur
      const token = 'local-token-' + Date.now();

      // Giriş bilgilerini kaydet
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        nickname: user.nickname,
        city: user.city,
        isAdmin: false
      }));

      // Kullanıcı giriş logunu ekle
      const userLogs = JSON.parse(localStorage.getItem('userLogs') || '[]');
      userLogs.unshift({
        id: Date.now(),
        action: 'LOGIN',
        status: 'SUCCESS',
        admin_nickname: user.nickname,
        description: `${user.nickname} kullanıcısı giriş yaptı`,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('userLogs', JSON.stringify(userLogs.slice(0, 100))); // Son 100 log

      setToken(token);
      setUser({
        id: user.id,
        nickname: user.nickname,
        city: user.city,
        isAdmin: false
      });

      toast.success('Giriş başarılı!');
      return { success: true };

    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // Geçici çözüm: Local storage tabanlı kayıt
      console.log('📝 Local storage tabanlı kayıt işlemi');

      const { nickname, password, confirmPassword, city } = userData;

      // Validasyon
      if (!nickname || !password || !confirmPassword || !city) {
        throw new Error('Tüm alanları doldurun');
      }

      if (password !== confirmPassword) {
        throw new Error('Şifreler eşleşmiyor');
      }

      if (password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalı');
      }

      // Local storage'dan mevcut kullanıcıları al
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

      // Kullanıcı adı kontrolü
      if (existingUsers.find(u => u.nickname === nickname)) {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor');
      }

      // Yeni kullanıcı oluştur
      const newUser = {
        id: Date.now(),
        nickname,
        password: password, // Basitçe düz text (demo için)
        city,
        createdAt: new Date().toISOString(),
        isAdmin: false
      };

      // Kullanıcıyı kaydet
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      // Kullanıcı kayıt logunu ekle
      const userLogs = JSON.parse(localStorage.getItem('userLogs') || '[]');
      userLogs.unshift({
        id: Date.now(),
        action: 'REGISTER',
        status: 'SUCCESS',
        admin_nickname: newUser.nickname,
        description: `${newUser.nickname} kullanıcısı kayıt oldu (${city})`,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('userLogs', JSON.stringify(userLogs.slice(0, 100)));

      // Mock token ve recovery code
      const token = 'local-token-' + Date.now();
      const recoveryCode = 'REC-' + Math.random().toString(36).substr(2, 6).toUpperCase();

      // Giriş yap
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        nickname: newUser.nickname,
        city: newUser.city,
        isAdmin: false
      }));

      setToken(token);
      setUser(newUser);

      toast.success('Kayıt başarılı!');
      return { success: true, recoveryCode };

    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
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