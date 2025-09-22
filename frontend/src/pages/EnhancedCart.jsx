import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const EnhancedCart = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        headers: isAuthenticated ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });
      const data = await response.json();

      if (data.success) {
        setCartItems(data.data || []);
      } else {
        // Fallback to localStorage for non-authenticated users
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(localCart);
      }
    } catch (error) {
      console.error('Sepet yükleme hatası:', error);
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(localCart);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    setUpdating(prev => ({ ...prev, [itemId]: true }));

    try {
      if (isAuthenticated) {
        const response = await fetch(`/api/cart/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ quantity: newQuantity })
        });

        if (response.ok) {
          fetchCart();
        }
      } else {
        // Local storage update
        const updatedCart = cartItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
    } catch (error) {
      console.error('Sepet güncelleme hatası:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    try {
      if (isAuthenticated) {
        const response = await fetch(`/api/cart/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          fetchCart();
        }
      } else {
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
    } catch (error) {
      console.error('Ürün silme hatası:', error);
    }
  };

  const clearCart = () => {
    if (confirm('Sepeti tamamen boşaltmak istediğinizden emin misiniz?')) {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const subtotal = getSubtotal();
    return subtotal >= 100 ? 0 : 15; // 100 TL üzeri ücretsiz kargo
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            🛒 Sepetim
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sepetiniz Boş
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın!
            </p>
            <Link
              to="/products"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              🌿 Ürünleri İncele
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🛒 Sepetim ({cartItems.length} ürün)
          </h1>

          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              🗑️ Sepeti Boşalt
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        🌿
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description?.substring(0, 80)}...
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        {item.price} ₺
                      </span>
                      {item.stock < 10 && (
                        <span className="text-red-500 text-xs">
                          Son {item.stock} adet!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={updating[item.id]}
                      className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      -
                    </button>

                    <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                      {updating[item.id] ? '...' : item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updating[item.id] || item.quantity >= item.stock}
                      className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {(item.price * item.quantity).toFixed(2)} ₺
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 text-sm mt-1"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                💰 Sipariş Özeti
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ara Toplam:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getSubtotal().toFixed(2)} ₺
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Kargo:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getShippingCost() === 0 ? 'Ücretsiz' : `${getShippingCost()} ₺`}
                  </span>
                </div>

                {getSubtotal() < 100 && (
                  <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      💡 {(100 - getSubtotal()).toFixed(2)} ₺ daha alışveriş yapın,
                      ücretsiz kargo kazanın!
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Toplam:</span>
                    <span className="text-green-600 dark:text-green-400">
                      {getTotal().toFixed(2)} ₺
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate('/checkout');
                      } else {
                        navigate('/auth/login?redirect=/checkout');
                      }
                    }}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    {isAuthenticated ? '🚀 Siparişi Tamamla' : '🔐 Giriş Yap & Devam Et'}
                  </button>

                  <Link
                    to="/products"
                    className="w-full block text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    🛍️ Alışverişe Devam Et
                  </Link>
                </div>

                {/* Payment Methods Preview */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    💳 Ödeme Seçenekleri
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>🏦 IBAN</span>
                    <span>•</span>
                    <span>₿ BTC</span>
                    <span>•</span>
                    <span>⟠ ETH</span>
                    <span>•</span>
                    <span>💲 USDT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCart;