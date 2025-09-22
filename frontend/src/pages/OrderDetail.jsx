import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Sipariş detayları yüklenemedi:', error);
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Sipariş bulunamadı</h2>
        <Link to="/orders" className="text-green-600 hover:text-green-700">
          Siparişlerime geri dön
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Link to="/" className="hover:text-green-600">Ana Sayfa</Link>
          <span>/</span>
          <Link to="/orders" className="hover:text-green-600">Siparişlerim</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Sipariş #{order.order_number}</span>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Sipariş #{order.order_number}</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <div className="text-gray-600">
              Sipariş Tarihi: {new Date(order.created_at).toLocaleDateString('tr-TR')}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Sipariş İçeriği</h2>
            <div className="space-y-4">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">🌿</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product_name}</h3>
                    <p className="text-gray-600 text-sm">Birim Fiyat: {item.price.toLocaleString('tr-TR')} ₺</p>
                    <p className="text-gray-600 text-sm">Adet: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Teslimat Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Teslimat Adresi</h3>
                <p className="text-gray-600">
                  {order.shipping_address.firstName} {order.shipping_address.lastName}<br />
                  {order.shipping_address.address}<br />
                  {order.shipping_address.district}, {order.shipping_address.city}<br />
                  📞 {order.shipping_address.phone}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Kargo Bilgisi</h3>
                {order.tracking_number ? (
                  <div>
                    <p className="text-gray-600 mb-2">Kargo Takip Numarası:</p>
                    <p className="font-mono bg-gray-100 p-2 rounded">
                      {order.tracking_number}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Henüz kargoya verilmedi</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Ara Toplam:</span>
                <span>{order.subtotal?.toLocaleString('tr-TR') || order.total_amount.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between">
                <span>Kargo:</span>
                <span className="text-green-600">Bedava</span>
              </div>
              <div className="flex justify-between">
                <span>Vergi:</span>
                <span>{order.tax_amount?.toLocaleString('tr-TR') || '0'} ₺</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Toplam:</span>
                <span className="text-green-600">{order.total_amount.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Ödeme Bilgisi</h3>
              <p className="text-gray-600 text-sm">
                {order.payment_method === 'bank' ? '🏦 Banka Transferi' : '🪙 Kripto Para'}
              </p>
              {order.payment_status && (
                <p className="text-sm mt-1">
                  Durum: <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                    {order.payment_status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                  </span>
                </p>
              )}
            </div>

            {order.status === 'pending' && (
              <div className="mt-6 pt-6 border-t">
                <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                  Siparişi İptal Et
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;