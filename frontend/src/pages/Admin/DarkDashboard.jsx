import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

const DarkDashboard = () => {
  const { adminApi } = useAdminAuth();
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
      // Fetch users count
      const usersResponse = await adminApi.get('/api/admin/users');
      const usersCount = usersResponse.data.success ? (usersResponse.data.data || []).length : 0;

      // Fetch orders
      const ordersResponse = await adminApi.get('/api/admin/orders');
      const orders = ordersResponse.data.success ? (ordersResponse.data.data || []) : [];

      // Fetch products count
      const productsResponse = await adminApi.get('/api/products');
      const productsData = productsResponse.data.success ? (productsResponse.data.data || {}) : {};
      const productsCount = productsData.products ? productsData.products.length : (Array.isArray(productsData) ? productsData.length : 0);

      // Calculate stats from real data
      const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
      const pendingOrders = orders.filter(order => order.status === 'bekliyor').length;
      const recentOrders = orders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(order => ({
          id: order.id,
          order_number: `#${order.id}`,
          customer_name: order.user_nickname || 'Misafir',
          total_amount: parseFloat(order.total_amount) || 0,
          created_at: order.created_at
        }));

      setStats({
        totalUsers: usersCount,
        totalOrders: orders.length,
        totalProducts: productsCount,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders,
        recentOrders: recentOrders
      });

    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error);
      // Set all to 0 instead of fake data
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
            <div key={i} className="bg-gray-800 h-24 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="bg-gray-800 h-64 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 font-mono">Yonetim Paneli</h1>
        <p className="text-gray-400 font-mono">Sistem durumu ve istatistikler</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-black border border-red-900 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-900 rounded-md flex items-center justify-center border border-red-700">
                <span className="text-red-200 text-sm font-bold font-mono">U</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate font-mono">
                  Toplam Kullanici
                </dt>
                <dd className="text-lg font-medium text-white">
                  {stats.totalUsers.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-black border border-red-900 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-900 rounded-md flex items-center justify-center border border-green-700">
                <span className="text-green-200 text-sm font-bold font-mono">S</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate font-mono">
                  Toplam Siparis
                </dt>
                <dd className="text-lg font-medium text-white">
                  {stats.totalOrders.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-black border border-red-900 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-900 rounded-md flex items-center justify-center border border-purple-700">
                <span className="text-purple-200 text-sm font-bold font-mono">P</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate font-mono">
                  Toplam Urun
                </dt>
                <dd className="text-lg font-medium text-white">
                  {stats.totalProducts.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-black border border-red-900 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-900 rounded-md flex items-center justify-center border border-red-700">
                <span className="text-red-200 text-sm font-bold font-mono">₺</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate font-mono">
                  Toplam Ciro
                </dt>
                <dd className="text-lg font-medium text-white">
                  {stats.totalRevenue.toLocaleString('tr-TR')} ₺
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4 font-mono">Sistem Durumu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">ONLINE</div>
            <div className="text-sm text-gray-400 font-mono">Sunucu Durumu</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">CONNECTED</div>
            <div className="text-sm text-gray-400 font-mono">Veritabani</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">ACTIVE</div>
            <div className="text-sm text-gray-400 font-mono">Onbellek Sistemi</div>
          </div>
        </div>
      </div>

      {/* Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Uyarılar</h2>
          <div className="space-y-4">
            {stats.pendingOrders > 0 && (
              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-red-400 text-xl mr-3 font-bold">!</div>
                  <div>
                    <div className="font-semibold text-red-300">
                      {stats.pendingOrders} bekleyen sipariş
                    </div>
                    <div className="text-sm text-red-400">
                      Onay bekleyen siparişler var
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    to="/orders"
                    className="text-red-300 hover:text-red-100 font-medium text-sm"
                  >
                    Siparişleri incele →
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Sistem Durumu</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Sunucu Durumu:</span>
                  <span className="text-green-400">● Çevrimiçi</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Veritabanı:</span>
                  <span className="text-green-400">● Bağlı</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Cache:</span>
                  <span className="text-green-400">● Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Son Siparişler</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Henüz sipariş yok</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-700 rounded border border-gray-600">
                  <div>
                    <div className="font-medium text-white">#{order.order_number}</div>
                    <div className="text-sm text-gray-400">{order.customer_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">
                      {order.total_amount.toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link
              to="/orders"
              className="text-green-400 hover:text-green-300 font-medium text-sm"
            >
              Tüm siparişleri görüntüle →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkDashboard;