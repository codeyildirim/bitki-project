import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'preparing': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'shipped': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Bekliyor',
      'confirmed': 'Onaylandı',
      'preparing': 'Hazırlanıyor',
      'shipped': 'Kargoda',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-8">📦 Siparişlerim</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-8xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Henüz siparişiniz yok</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Alışverişe başlamak için ürünlerimize göz atın</p>
          <Link
            to="/products"
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors inline-block"
          >
            Ürünleri İncele
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sipariş #{order.order_number}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-green-600">
                    {order.total_amount.toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Teslimat Adresi</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {order.shipping_address.firstName} {order.shipping_address.lastName}<br />
                    {order.shipping_address.address}<br />
                    {order.shipping_address.district}, {order.shipping_address.city}<br />
                    {order.shipping_address.phone}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Ödeme Bilgisi</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {order.payment_method === 'bank' ? '🏦 Banka Transferi' : '🪙 Kripto Para'}<br />
                    {order.tracking_number && (
                      <span>
                        Kargo Takip: <strong>{order.tracking_number}</strong>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Sipariş İçeriği</h4>
                <div className="space-y-2">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
                          <span className="text-xl">🌿</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{item.product_name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Adet: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Link
                  to={`/orders/${order.id}`}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Detayları Görüntüle →
                </Link>
                {order.status === 'pending' && (
                  <button className="text-red-600 hover:text-red-700 text-sm">
                    Siparişi İptal Et
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;