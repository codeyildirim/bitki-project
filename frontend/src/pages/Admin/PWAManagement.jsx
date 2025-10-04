import React, { useState, useEffect } from 'react';
import {
  Smartphone, Download, Users, Bell, Send, Calendar,
  TrendingUp, Activity, Monitor, Tablet, Clock, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PWAManagement = () => {
  const { adminApi } = useAdminAuth();
  const [stats, setStats] = useState({
    totalInstalls: 0,
    activeUsers: 0,
    last30Days: [],
    deviceStats: []
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    body: '',
    icon: '/icon-192x192.png',
    url: '/',
    targetAudience: 'all',
    targetUserIds: [],
    scheduledAt: ''
  });

  useEffect(() => {
    fetchPWAStats();
    fetchNotifications();
  }, []);

  const fetchPWAStats = async () => {
    try {
      console.log('🔍 PWA Stats API URL: /pwa/stats');

      const response = await adminApi.get('/pwa/stats');

      console.log('✅ PWA Stats Response:', response.data);

      if (response.data.success) {
        setStats(response.data.data);
        toast.success('İstatistikler yüklendi');
      } else {
        console.error('❌ API Response not successful:', response.data);
        toast.error(response.data.message || 'İstatistikler yüklenemedi');
      }
    } catch (error) {
      console.error('❌ PWA istatistikleri yüklenemedi:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: '/api/pwa/stats'
      });
      toast.error(`İstatistikler yüklenemedi: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      console.log('🔍 PWA Notifications API URL: /pwa/notifications');

      const response = await adminApi.get('/pwa/notifications');

      console.log('✅ PWA Notifications Response:', response.data);

      if (response.data.success) {
        setNotifications(response.data.data);
      } else {
        console.error('❌ Notifications API Response not successful:', response.data);
        toast.error(response.data.message || 'Bildirimler yüklenemedi');
      }
    } catch (error) {
      console.error('❌ Bildirimler yüklenemedi:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: '/api/pwa/notifications'
      });
      toast.error(`Bildirimler yüklenemedi: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminApi.post('/pwa/notifications/send', notificationForm);

      if (response.data.success) {
        toast.success('Bildirim gönderildi');
        fetchNotifications();
        setShowNotificationModal(false);
        resetNotificationForm();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bildirim gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await adminApi.delete(`/pwa/notifications/${id}`);

      if (response.data.success) {
        toast.success('Bildirim silindi');
        fetchNotifications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bildirim silinemedi');
    }
  };

  const resetNotificationForm = () => {
    setNotificationForm({
      title: '',
      body: '',
      icon: '/icon-192x192.png',
      url: '/',
      targetAudience: 'all',
      targetUserIds: [],
      scheduledAt: ''
    });
  };

  const clearCacheAndReload = () => {
    if (window.confirm('Bu işlem tüm local storage ve cache\'i temizleyecektir. Devam etmek istiyor musunuz?')) {
      // LocalStorage temizle
      localStorage.clear();

      // SessionStorage temizle
      sessionStorage.clear();

      // Service Worker cache temizle
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }

      toast.success('Cache temizlendi, sayfa yenileniyor...');

      // Sayfa yenileme
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // Chart verilerini hazırla
  const prepareChartData = () => {
    const grouped = stats.last30Days.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = { date, install: 0, launch: 0, uninstall: 0 };
      }
      acc[date][item.event_type] = item.count;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const chartData = prepareChartData();

  // Cihaz istatistikleri için renkler
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getDeviceIcon = (deviceInfo) => {
    try {
      const info = JSON.parse(deviceInfo);
      if (info.mobile) return <Smartphone className="inline" size={16} />;
      if (info.tablet) return <Tablet className="inline" size={16} />;
      return <Monitor className="inline" size={16} />;
    } catch {
      return <Monitor className="inline" size={16} />;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          PWA Yönetimi
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={clearCacheAndReload}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            title="Cache ve LocalStorage'ı temizle"
          >
            🗑️ Cache Temizle
          </button>
          <button
            onClick={() => setShowNotificationModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Send size={20} />
            Bildirim Gönder
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity size={20} />
              İstatistikler
            </div>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell size={20} />
              Bildirimler
            </div>
          </button>
        </nav>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Özet Kartlar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toplam İndirme</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalInstalls}
                  </p>
                </div>
                <Download className="text-green-600" size={32} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Kullanıcı</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.activeUsers}
                  </p>
                  <p className="text-xs text-gray-500">Son 7 gün</p>
                </div>
                <Users className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Günlük Ortalama</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {chartData.length > 0
                      ? Math.round(chartData.reduce((acc, d) => acc + d.launch, 0) / chartData.length)
                      : 0}
                  </p>
                  <p className="text-xs text-gray-500">Açılış</p>
                </div>
                <TrendingUp className="text-purple-600" size={32} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dönüşüm Oranı</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalInstalls > 0
                      ? `${Math.round((stats.activeUsers / stats.totalInstalls) * 100)}%`
                      : '0%'}
                  </p>
                  <p className="text-xs text-gray-500">İndirme → Aktif</p>
                </div>
                <Activity className="text-orange-600" size={32} />
              </div>
            </div>
          </div>

          {/* Grafikler */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zaman Serisi Grafiği */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Son 30 Gün Aktivite</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="install" stroke="#10b981" name="İndirme" />
                  <Line type="monotone" dataKey="launch" stroke="#3b82f6" name="Açılış" />
                  <Line type="monotone" dataKey="uninstall" stroke="#ef4444" name="Kaldırma" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cihaz Dağılımı */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Cihaz Dağılımı</h3>
              {stats.deviceStats && stats.deviceStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.deviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.deviceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">Henüz veri yok</p>
              )}
            </div>
          </div>

          {/* Detaylı Cihaz Listesi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <h3 className="text-lg font-semibold p-4 border-b">Cihaz Detayları</h3>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Cihaz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    İndirme Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Oran
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.deviceStats && stats.deviceStats.map((device, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDeviceIcon(device.device_info)}
                      <span className="ml-2">{device.device_info}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{device.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stats.totalInstalls > 0
                        ? `${((device.count / stats.totalInstalls) * 100).toFixed(1)}%`
                        : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  İçerik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Hedef
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Gönderim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <tr key={notification.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Bell className="mr-2 text-gray-400" size={16} />
                      <span className="font-medium">{notification.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                      {notification.body}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {notification.target_audience === 'all' ? 'Herkes' : notification.target_audience}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      {notification.scheduled_at ? (
                        <>
                          <Clock size={16} className="mr-1 text-gray-400" />
                          {new Date(notification.scheduled_at).toLocaleString('tr-TR')}
                        </>
                      ) : notification.sent_at ? (
                        <>
                          <CheckCircle size={16} className="mr-1 text-green-600" />
                          {new Date(notification.sent_at).toLocaleString('tr-TR')}
                        </>
                      ) : (
                        'Bekliyor'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {notification.is_sent ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Gönderildi ({notification.sent_count})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        Bekliyor
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!notification.is_sent && (
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Sil
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Push Bildirim Gönder</h2>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Başlık</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">İçerik</label>
                <textarea
                  value={notificationForm.body}
                  onChange={(e) => setNotificationForm({ ...notificationForm, body: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Yönlendirme URL</label>
                <input
                  type="text"
                  value={notificationForm.url}
                  onChange={(e) => setNotificationForm({ ...notificationForm, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hedef Kitle</label>
                <select
                  value={notificationForm.targetAudience}
                  onChange={(e) => setNotificationForm({ ...notificationForm, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">Herkes</option>
                  <option value="customers">Müşteriler</option>
                  <option value="admins">Adminler</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Zamanlama (Opsiyonel)</label>
                <input
                  type="datetime-local"
                  value={notificationForm.scheduledAt}
                  onChange={(e) => setNotificationForm({ ...notificationForm, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Gönderiliyor...' : 'Gönder'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotificationModal(false);
                    resetNotificationForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAManagement;