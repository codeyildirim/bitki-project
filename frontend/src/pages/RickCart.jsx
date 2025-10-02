import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

const RickCart = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      if (isAuthenticated) {
        const response = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setCartItems(data.data || []);
        }
      } else {
        // Giriş yapmamış kullanıcılar için localStorage
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

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    // localStorage'ı güncelle
    const updatedItems = cartItems.map(item =>
      item.id === itemId
        ? { ...item, quantity: newQuantity }
        : item
    );
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));

    // localStorage'ı güncelle
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discounted_price || item.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!isAuthenticated) {
      // Giriş yapmamış kullanıcıları login sayfasına yönlendir
      navigate('/auth/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative z-0">
        <div className="relative z-0 min-h-screen backdrop-blur-sm py-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-float">🛒</div>
              <p className="text-xl font-sans text-white">Sepet yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-0">
      <div className="relative z-0 min-h-screen backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          {/* Başlık */}
          <div className="text-center mb-6 sm:mb-8 px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white drop-shadow-2xl mb-3 sm:mb-4 animate-float">
              Sepetim
            </h1>
            <p className="text-base sm:text-lg font-sans text-gray-100 drop-shadow-lg">
              Ürünlerinizi kontrol edin ve siparişinizi tamamlayın
            </p>
          </div>

          {/* Geri Dön Butonu */}
          <div className="mb-4 sm:mb-6 px-4">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-rick-purple text-white px-4 sm:px-6 py-2 sm:py-3 rounded-none hover:scale-105 transition-all duration-300 font-heading font-semibold text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Alışverişe Devam Et</span>
            </Link>
          </div>

          {/* Sepet İçeriği */}
          {cartItems.length === 0 ? (
            /* Boş Sepet */
            <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-none border-b-4 border-rick-green max-w-md mx-auto">
                <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6 text-rick-green animate-bounce-slow">🛒</div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Sepet Boş
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-sans mb-4 sm:mb-6">
                  Henüz sepetinizde ürün bulunmuyor.
                  Harika ürünlerimizi keşfetmek için alışverişe başlayın!
                </p>
                <Link
                  to="/products"
                  className="w-full sm:w-auto bg-rick-green text-white px-6 sm:px-8 py-3 sm:py-4 rounded-none hover:scale-105 hover:animate-slime-drip transition-all duration-300 font-heading font-semibold text-base sm:text-lg inline-block"
                >
                  Ürünleri Keşfet
                </Link>
              </div>
            </div>
          ) : (
            /* Dolu Sepet */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
              {/* Sepet Ürünleri */}
              <div className="lg:col-span-2">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-none border-b-4 border-rick-green overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-gray-900 dark:text-white">
                        Sepetinizdeki Ürünler ({cartItems.length})
                      </h2>
                      <button
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-700 font-sans text-sm hover:scale-105 transition-all duration-300 self-start sm:self-auto"
                      >
                        Sepeti Temizle
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-3 sm:p-4 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                          {/* Ürün Görseli */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-600 rounded-none overflow-hidden border-2 border-rick-green flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl text-rick-green">
                                🌿
                              </div>
                            )}
                          </div>

                          {/* Ürün Bilgileri */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-heading font-semibold text-gray-900 dark:text-white mb-1 truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-sans">
                              {item.category_name}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1 sm:mt-2">
                              <span className="text-base sm:text-lg font-heading font-bold text-rick-green">
                                ₺{(item.discounted_price || item.price || 0).toLocaleString('tr-TR')}
                              </span>
                              {item.discounted_price && (
                                <span className="text-xs sm:text-sm text-gray-500 line-through font-sans">
                                  ₺{item.price.toLocaleString('tr-TR')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Alt Kısım: Miktar ve Silme (Mobilde Ayrı Satır) */}
                          <div className="flex items-center justify-between sm:justify-start sm:space-x-4 w-full sm:w-auto">
                            {/* Miktar Kontrolü */}
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <button
                                onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-none hover:bg-rick-purple hover:text-white transition-all duration-300 flex items-center justify-center"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <span className="w-8 sm:w-12 text-center font-heading font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                {item.quantity || 1}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-none hover:bg-rick-green hover:text-white transition-all duration-300 flex items-center justify-center"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>

                            {/* Silme Butonu */}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:scale-110 transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sepet Özeti */}
              <div className="lg:col-span-1">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-none border-b-4 border-rick-purple p-4 sm:p-6 lg:sticky lg:top-8">
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                    Sipariş Özeti
                  </h3>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex justify-between font-sans text-sm sm:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Ürün Sayısı:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} adet
                      </span>
                    </div>
                    <div className="flex justify-between font-sans text-sm sm:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Ara Toplam:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₺{calculateTotal().toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex justify-between font-sans text-sm sm:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Kargo:</span>
                      <span className="font-semibold text-rick-green">Ücretsiz</span>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <div className="flex justify-between text-lg sm:text-xl">
                      <span className="font-heading font-bold text-gray-900 dark:text-white">Toplam:</span>
                      <span className="font-heading font-bold text-rick-green">
                        ₺{calculateTotal().toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-rick-green text-white py-3 sm:py-4 px-4 sm:px-6 rounded-none hover:bg-green-600 hover:scale-105 hover:animate-slime-drip transition-all duration-300 font-heading font-semibold text-base sm:text-lg flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Siparişi Tamamla</span>
                  </button>

                  {!isAuthenticated && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center mt-2 sm:mt-3 font-sans">
                      Ödeme için giriş yapmanız gerekiyor
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RickCart;