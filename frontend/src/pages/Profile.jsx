import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    nickname: '',
    city: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        nickname: user.nickname || '',
        city: user.city || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    fetchCities();
  }, [user]);

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      if (data.success) {
        setCities(data.data);
      }
    } catch (error) {
      console.error('Şehirler yüklenemedi:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updateData = {
        nickname: profileData.nickname,
        city: profileData.city
      };

      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          setMessage('Yeni şifreler eşleşmiyor');
          return;
        }
        updateData.currentPassword = profileData.currentPassword;
        updateData.newPassword = profileData.newPassword;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Profil başarıyla güncellendi');
        setProfileData({
          ...profileData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        if (updateProfile) {
          updateProfile(data.data);
        }
      } else {
        setMessage(data.message || 'Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      setMessage('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-8">👤 Profil</h1>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={profileData.nickname}
              onChange={(e) => setProfileData({...profileData, nickname: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              pattern="[A-Za-z0-9_.]+"
              title="Sadece harf, rakam, alt çizgi ve nokta kullanabilirsiniz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Şehir
            </label>
            <select
              value={profileData.city}
              onChange={(e) => setProfileData({...profileData, city: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Şehir seçin</option>
              {cities.map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Şifre Değiştir</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={profileData.confirmPassword}
                  onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  minLength="6"
                />
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded ${message.includes('başarıyla') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">🔑 Kurtarma Kodu</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Şifrenizi unutursanız kurtarma kodunuzu kullanabilirsiniz.
            Kurtarma kodunuzu güvenli bir yerde saklayın.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;