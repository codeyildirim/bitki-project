import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, MapPin, ShoppingBag, Heart, Settings, LogOut, Plus, Trash2, Edit3, Check, X } from 'lucide-react';

const EnhancedProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Profile data
  const [profileData, setProfileData] = useState({
    nickname: '',
    city: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    title: '',
    full_name: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    postal_code: ''
  });

  // Cities data for address form
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Orders
  const [orders, setOrders] = useState([]);

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
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch cities
      const citiesResponse = await fetch('/api/cities');
      const citiesData = await citiesResponse.json();
      if (citiesData.success) {
        setCities(citiesData.data);
      }

      // Fetch addresses
      const addressResponse = await fetch('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const addressData = await addressResponse.json();
      if (addressData.success) {
        setAddresses(addressData.data || []);
      }

      // Fetch orders
      const ordersResponse = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const ordersData = await ordersResponse.json();
      if (ordersData.success) {
        setOrders(ordersData.data || []);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
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
      setSaving(false);
    }
  };

  const handleCityChange = (cityName) => {
    const city = cities.find(c => c.name === cityName);
    setDistricts(city ? city.districts : []);
    setNewAddress(prev => ({ ...prev, city: cityName, district: '' }));
  };

  const saveAddress = async () => {
    if (!newAddress.title || !newAddress.full_name || !newAddress.phone ||
        !newAddress.city || !newAddress.district || !newAddress.address) {
      setMessage('Tüm zorunlu alanları doldurun');
      return;
    }

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newAddress)
      });

      const data = await response.json();
      if (data.success) {
        setAddresses(prev => [...prev, data.data]);
        setNewAddress({
          title: '', full_name: '', phone: '', city: '', district: '', address: '', postal_code: ''
        });
        setMessage('Adres başarıyla eklendi');
      } else {
        setMessage(data.message || 'Adres eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Adres kayıt hatası:', error);
      setMessage('Adres kayıt hatası');
    }
  };

  const deleteAddress = async (addressId) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        setMessage('Adres silindi');
      }
    } catch (error) {
      console.error('Adres silme hatası:', error);
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}/default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          is_default: addr.id === addressId ? 1 : 0
        })));
        setMessage('Varsayılan adres güncellendi');
      }
    } catch (error) {
      console.error('Varsayılan adres ayarlama hatası:', error);
    }
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      'bekliyor': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'onaylandı': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'hazırlanıyor': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'kargoda': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'tamamlandı': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'iptal': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const tabs = [
    { id: 'profile', label: 'Profil Bilgileri', icon: User },
    { id: 'addresses', label: 'Adreslerim', icon: MapPin },
    { id: 'orders', label: 'Siparişlerim', icon: ShoppingBag },
    { id: 'settings', label: 'Ayarlar', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-8"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            👤 Hesabım
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hoş geldin, {user?.nickname}! Profil bilgilerin ve siparişlerin burada.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Çıkış Yap</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Profil Bilgileri
                  </h2>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Kullanıcı Adı
                        </label>
                        <input
                          type="text"
                          value={profileData.nickname}
                          onChange={(e) => setProfileData({...profileData, nickname: e.target.value})}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          pattern="[A-Za-z0-9_.]+"
                          title="Sadece harf, rakam, alt çizgi ve nokta kullanabilirsiniz"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Şehir
                        </label>
                        <select
                          value={profileData.city}
                          onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        >
                          <option value="">Şehir seçin</option>
                          {cities.map(city => (
                            <option key={city.name} value={city.name}>{city.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Şifre Değiştir
                      </h3>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mevcut Şifre
                          </label>
                          <input
                            type="password"
                            value={profileData.currentPassword}
                            onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Yeni Şifre
                          </label>
                          <input
                            type="password"
                            value={profileData.newPassword}
                            onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            minLength="6"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Yeni Şifre (Tekrar)
                          </label>
                          <input
                            type="password"
                            value={profileData.confirmPassword}
                            onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            minLength="6"
                          />
                        </div>
                      </div>
                    </div>

                    {message && (
                      <div className={`p-3 rounded-lg ${
                        message.includes('başarıyla')
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
                    >
                      {saving ? 'Güncelleniyor...' : 'Profili Güncelle'}
                    </button>
                  </form>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Adreslerim
                    </h2>
                  </div>

                  {/* Existing Addresses */}
                  {addresses.length > 0 && (
                    <div className="mb-8 space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {address.title}
                                </h3>
                                {address.is_default && (
                                  <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-xs">
                                    Varsayılan
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-400">
                                {address.full_name} - {address.phone}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {address.address}, {address.district}, {address.city}
                              </p>
                              {address.postal_code && (
                                <p className="text-gray-600 dark:text-gray-400">
                                  Posta Kodu: {address.postal_code}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {!address.is_default && (
                                <button
                                  onClick={() => setDefaultAddress(address.id)}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  Varsayılan Yap
                                </button>
                              )}
                              <button
                                onClick={() => deleteAddress(address.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Address Form */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Yeni Adres Ekle
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Adres başlığı (Ev, İş vb.)"
                        value={newAddress.title}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, title: e.target.value }))}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Ad Soyad"
                        value={newAddress.full_name}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, full_name: e.target.value }))}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="tel"
                        placeholder="Telefon"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <select
                        value={newAddress.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Şehir Seçin</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                      <select
                        value={newAddress.district}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, district: e.target.value }))}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        disabled={!newAddress.city}
                      >
                        <option value="">İlçe Seçin</option>
                        {districts.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Posta Kodu"
                        value={newAddress.postal_code}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      <textarea
                        placeholder="Detaylı adres"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                        className="md:col-span-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white rows-3"
                      />
                    </div>
                    <button
                      onClick={saveAddress}
                      className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Adresi Kaydet
                    </button>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Siparişlerim
                  </h2>

                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Henüz sipariş yok
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        İlk siparişinizi vermek için ürünlerimize göz atın
                      </p>
                      <a
                        href="/products"
                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Ürünleri İncele
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                Sipariş #{order.id}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(order.created_at).toLocaleDateString('tr-TR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <span className="font-bold text-green-600 dark:text-green-400">
                                {order.total_amount} ₺
                              </span>
                            </div>
                          </div>

                          {order.items && order.items.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Sipariş İçeriği:
                              </h4>
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {item.productName} x{item.quantity}
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                      {(item.price * item.quantity).toFixed(2)} ₺
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {order.tracking_number && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Kargo Takip No:</strong> {order.tracking_number}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Hesap Ayarları
                  </h2>

                  <div className="space-y-6">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                        🔑 Kurtarma Kodu
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Şifrenizi unutursanız kurtarma kodunuzu kullanabilirsiniz.
                        Kurtarma kodunuzu güvenli bir yerde saklayın.
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                      <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                        ⚠️ Hesap Silme
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        Hesabınızı kalıcı olarak silmek istiyorsanız, tüm verileriniz silinecektir.
                        Bu işlem geri alınamaz.
                      </p>
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        onClick={() => {
                          if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
                            // TODO: Implement account deletion
                            alert('Hesap silme özelliği henüz aktif değil.');
                          }
                        }}
                      >
                        Hesabı Sil
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfile;