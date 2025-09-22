import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

const AdminOrders = () => {
  const { adminApi } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await adminApi.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Orders loading failed:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status, tracking = '') => {
    try {
      const response = await adminApi.put(`/orders/${orderId}/status`, {
        status,
        trackingNumber: tracking
      });

      if (response.data.success) {
        fetchOrders();
        setSelectedOrder(null);
        setStatusUpdate('');
        setTrackingNumber('');
      }
    } catch (error) {
      console.error('Order status update failed:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'bekliyor': return 'text-yellow-400';
      case 'onaylandı': return 'text-green-400';
      case 'hazırlanıyor': return 'text-blue-400';
      case 'kargoda': return 'text-purple-400';
      case 'tamamlandı': return 'text-green-400';
      case 'iptal': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white font-mono">Sipariş Yönetimi</h1>
        <p className="text-gray-400 font-mono">Siparişleri takip et, durumlarını güncelle ve kargo yönet</p>
      </div>

      {/* Orders List */}
      <div className="bg-black border border-red-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  Sipariş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400 font-mono">
                    Henüz sipariş bulunmuyor
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white font-mono">
                        #{order.id}
                      </div>
                      {order.tracking_number && (
                        <div className="text-xs text-gray-400 font-mono">
                          Kargo: {order.tracking_number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                      {order.user_nickname || 'Misafir'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                      ₺{order.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 text-xs leading-5 font-semibold font-mono ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                      {new Date(order.created_at).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-red-400 hover:text-red-300 font-mono"
                      >
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-black border border-red-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white font-mono mb-4">
              Sipariş #{selectedOrder.id} Durumu Güncelle
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                  Durum
                </label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                >
                  <option value="">Durum seçin...</option>
                  <option value="bekliyor">Bekliyor</option>
                  <option value="onaylandı">Onaylandı</option>
                  <option value="hazırlanıyor">Hazırlanıyor</option>
                  <option value="kargoda">Kargoda</option>
                  <option value="tamamlandı">Tamamlandı</option>
                  <option value="iptal">İptal</option>
                </select>
              </div>

              {(statusUpdate === 'kargoda' || statusUpdate === 'tamamlandı') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                    Kargo Takip Numarası
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                    placeholder="Kargo takip numarası..."
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, statusUpdate, trackingNumber)}
                  disabled={!statusUpdate}
                  className="bg-green-900 hover:bg-green-800 disabled:bg-gray-700 text-green-200 disabled:text-gray-400 px-4 py-2 rounded-lg transition-colors border border-green-700 disabled:border-gray-600 font-mono"
                >
                  Güncelle
                </button>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setStatusUpdate('');
                    setTrackingNumber('');
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors border border-gray-600 font-mono"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;