import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sepet verilerini yükle (localStorage'dan veya API'den)
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(productId);
      return;
    }
    const updatedCart = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-8">🛒 Sepetim</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-8xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Sepetiniz boş</h3>
          <p className="text-gray-500 mb-6">Alışverişe başlamak için ürünlerimize göz atın</p>
          <Link
            to="/products"
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors inline-block"
          >
            Ürünleri İncele
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">🌿</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                    <div className="text-green-600 font-bold">
                      {item.price.toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
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
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h3 className="font-bold text-lg mb-4">Sipariş Özeti</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Ara Toplam:</span>
                  <span>{getTotalPrice().toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo:</span>
                  <span className="text-green-600">Bedava</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Toplam:</span>
                  <span className="text-green-600">{getTotalPrice().toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>
              {isAuthenticated ? (
                <Link
                  to="/checkout"
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors text-center block"
                >
                  Siparişi Tamamla
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/auth/login"
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors text-center block"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/auth/register"
                    className="w-full bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors text-center block"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;