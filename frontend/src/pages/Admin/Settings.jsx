import React, { useState, useEffect } from 'react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Şifalı Bitkiler',
    siteDescription: 'Doğal şifalı bitkiler ve gıda takviyesi merkezi',
    currency: 'TL',
    taxRate: 20,
    shippingCost: 29.99,
    freeShippingThreshold: 150,
    maintenanceMode: false,
    emailNotifications: true,
    pushNotifications: true,
    autoApproveComments: false,
    maxFileSize: 5,
    maxProductImages: 10,
    sessionTimeout: 30,
    passwordMinLength: 6,
    enableTwoFactor: false,
    supportEmail: 'destek@sifalibitkiler.com',
    supportPhone: '+90 555 123 4567',
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error('Settings yüklenirken hata:', error);
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await response.json();

      if (data.success) {
        setMessage('Ayarlar başarıyla kaydedildi');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Hata: ' + data.message);
      }
    } catch (error) {
      setMessage('Ayarlar kaydedilirken hata oluştu');
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const tabs = [
    { id: 'general', name: 'Genel Ayarlar', icon: '◉' },
    { id: 'commerce', name: 'E-Ticaret', icon: '◈' },
    { id: 'security', name: 'Güvenlik', icon: '◇' },
    { id: 'notifications', name: 'Bildirimler', icon: '◆' },
    { id: 'contact', name: 'İletişim', icon: '◎' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white font-mono">[CFG] System Configuration</h1>
        <p className="text-gray-400 font-mono">Manage site settings, payment options, and system parameters</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-black border border-red-900 rounded-lg">
        <div className="flex space-x-1 p-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded font-mono text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-900 text-red-200 border border-red-700'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <span className="text-green-400">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-black border border-red-900 rounded-lg p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white font-mono mb-4">[GENERAL] Site Ayarları</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Site Adı
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Para Birimi
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="TL">Türk Lirası (TL)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Site Açıklaması
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="flex items-center space-x-3 text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
                  />
                  <span className="font-mono">Bakım Modu</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Commerce Settings */}
        {activeTab === 'commerce' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white font-mono mb-4">[COMMERCE] E-Ticaret Ayarları</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  KDV Oranı (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.taxRate}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Kargo Ücreti ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.shippingCost}
                  onChange={(e) => handleInputChange('shippingCost', parseFloat(e.target.value))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Ücretsiz Kargo Limiti ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Maksimum Dosya Boyutu (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxFileSize}
                  onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Maksimum Ürün Resim Sayısı
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.maxProductImages}
                  onChange={(e) => handleInputChange('maxProductImages', parseInt(e.target.value))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white font-mono mb-4">[SECURITY] Güvenlik Ayarları</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Oturum Zaman Aşımı (dakika)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Minimum Şifre Uzunluğu
                </label>
                <input
                  type="number"
                  min="4"
                  max="20"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="flex items-center space-x-3 text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings.enableTwoFactor}
                    onChange={(e) => handleInputChange('enableTwoFactor', e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
                  />
                  <span className="font-mono">İki Faktörlü Kimlik Doğrulama</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3 text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings.autoApproveComments}
                    onChange={(e) => handleInputChange('autoApproveComments', e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
                  />
                  <span className="font-mono">Yorumları Otomatik Onayla</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white font-mono mb-4">[NOTIFY] Bildirim Ayarları</h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="flex items-center space-x-3 text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
                  />
                  <span className="font-mono">E-posta Bildirimleri</span>
                </label>
                <p className="text-gray-400 text-sm ml-7 font-mono">Yeni siparişler ve önemli olaylar için e-posta gönder</p>
              </div>

              <div>
                <label className="flex items-center space-x-3 text-gray-300">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
                  />
                  <span className="font-mono">Push Bildirimleri</span>
                </label>
                <p className="text-gray-400 text-sm ml-7 font-mono">PWA ve browser bildirimleri gönder</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Settings */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white font-mono mb-4">[CONTACT] İletişim Bilgileri</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Destek E-postası
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Destek Telefonu
                </label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Facebook
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.facebook}
                  onChange={(e) => handleSocialChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Instagram
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.instagram}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Twitter
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.twitter}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={settings.socialLinks.linkedin}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/..."
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-red-900 mt-8">
          {message && (
            <div className={`px-4 py-2 rounded font-mono text-sm ${
              message.includes('başarıyla')
                ? 'bg-green-900 text-green-200 border border-green-700'
                : 'bg-red-900 text-red-200 border border-red-700'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={saveSettings}
            disabled={loading}
            className="px-6 py-3 bg-red-900 text-red-200 rounded hover:bg-red-800 transition-colors font-mono border border-red-700 disabled:opacity-50"
          >
            {loading ? '[SAVING] Kaydediliyor...' : '[SAVE] Ayarları Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;