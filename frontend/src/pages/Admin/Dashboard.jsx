import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Dashboard istatistiklerini yükle - PRODUCTION URL
      const response = await fetch('https://bitki-backend.onrender.com/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        // Eğer API'den veri gelmezse demo veriler kullan
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          recentOrders: []
        });
      }
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error);
      // Hata durumunda gerçek durumu yansıt
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">[DASH] Dashboard</h1>
        <p className="text-gray-600">Genel bakış ve istatistikler</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">[U]</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Toplam Kullanıcı
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalUsers.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">[O]</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Toplam Sipariş
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalOrders.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">[P]</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Toplam Ürün
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalProducts.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">[₺]</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Toplam Ciro
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalRevenue.toLocaleString('tr-TR')} ₺
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/products"
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
        >
          <div className="text-2xl mb-2">[PROD]</div>
          <div className="font-semibold">Ürün Yönetimi</div>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          <div className="text-2xl mb-2">[ORD]</div>
          <div className="font-semibold">Sipariş Yönetimi</div>
        </Link>
        <Link
          to="/admin/users"
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
        >
          <div className="text-2xl mb-2">[USER]</div>
          <div className="font-semibold">Kullanıcı Yönetimi</div>
        </Link>
        <Link
          to="/admin/blog"
          className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors text-center"
        >
          <div className="text-2xl mb-2">[BLOG]</div>
          <div className="font-semibold">Blog Yönetimi</div>
        </Link>
      </div>

      {/* Recent Orders & Pending Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Son Siparişler</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Henüz sipariş yok</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">#{order.order_number}</div>
                    <div className="text-sm text-gray-600">{order.customer_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {order.total_amount.toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link
              to="/admin/orders"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Tüm siparişleri görüntüle →
            </Link>
          </div>
        </div>

        {/* Pending Orders Alert */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Bekleyen İşlemler</h2>
          <div className="space-y-4">
            {stats.pendingOrders > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-red-600 text-xl mr-3">[!]</div>
                  <div>
                    <div className="font-semibold text-red-800">
                      {stats.pendingOrders} bekleyen sipariş
                    </div>
                    <div className="text-sm text-red-700">
                      Onay bekleyen siparişler var
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    to="/admin/orders?status=pending"
                    className="text-red-700 hover:text-red-800 font-medium"
                  >
                    Siparişleri incele →
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Hızlı Eylemler</h3>
              <div className="space-y-2">
                <Link
                  to="/admin/products/new"
                  className="block text-green-600 hover:text-green-700 text-sm"
                >
                  • Yeni ürün ekle
                </Link>
                <Link
                  to="/admin/blog/new"
                  className="block text-green-600 hover:text-green-700 text-sm"
                >
                  • Yeni blog yazısı ekle
                </Link>
                <Link
                  to="/admin/settings"
                  className="block text-green-600 hover:text-green-700 text-sm"
                >
                  • Site ayarlarını düzenle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;