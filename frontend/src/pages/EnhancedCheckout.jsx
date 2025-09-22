import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CryptoPayment from '../components/payment/CryptoPayment';

const EnhancedCheckout = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    title: '',
    full_name: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    postal_code: ''
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Türkiye şehirleri
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    fetchInitialData();
    loadCities();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Sepet verilerini al
      const cartResponse = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const cartData = await cartResponse.json();

      // Adresler
      const addressResponse = await fetch('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const addressData = await addressResponse.json();

      // Ödeme yöntemleri
      const paymentResponse = await fetch('/api/payment/methods');
      const paymentData = await paymentResponse.json();

      if (cartData.success) setCartItems(cartData.data || []);
      if (addressData.success) setAddresses(addressData.data || []);
      if (paymentData.success) setPaymentMethods(paymentData.data || []);

      // Varsayılan adres seç
      const defaultAddr = addressData.data?.find(addr => addr.is_default);
      if (defaultAddr) setSelectedAddress(defaultAddr.id);

    } catch (error) {
      console.error('Checkout veriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      // Bu normalde API'den gelecek, şimdilik static
      const turkeyData = {
        cities: [
          { id: 34, name: 'İstanbul', districts: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Fatih', 'Beyoğlu'] },
          { id: 6, name: 'Ankara', districts: ['Çankaya', 'Keçiören', 'Mamak', 'Sincan', 'Altındağ'] },
          { id: 35, name: 'İzmir', districts: ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Balçova'] }
        ]
      };
      setCities(turkeyData.cities);
    } catch (error) {
      console.error('Şehir verileri yükleme hatası:', error);
    }
  };

  const handleCityChange = (cityName) => {
    const city = cities.find(c => c.name === cityName);
    setDistricts(city ? city.districts : []);
    setNewAddress(prev => ({ ...prev, city: cityName, district: '' }));
  };

  const saveNewAddress = async () => {
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
        setSelectedAddress(data.data.id);
        setNewAddress({
          title: '', full_name: '', phone: '', city: '', district: '', address: '', postal_code: ''
        });
      }
    } catch (error) {
      console.error('Adres kayıt hatası:', error);
    }
  };

  const createOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      alert('Lütfen adres ve ödeme yöntemi seçin');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedAddr = addresses.find(addr => addr.id === selectedAddress);

      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity
        })),
        shipping_address: selectedAddr,
        payment_method: selectedPayment.type,
        notes: orderNotes
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        // Ödeme sayfasına yönlendir
        navigate(`/payment/${data.data.id}`, {
          state: { order: data.data, paymentMethod: selectedPayment }
        });
      } else {
        alert(data.message || 'Sipariş oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      alert('Sipariş oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    return getSubtotal() >= 100 ? 0 : 15;
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Sepetiniz Boş
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sipariş verebilmek için sepetinizde ürün olması gerekiyor.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-20 h-1 ${
                    currentStep > step ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-16">
            <span className="text-sm text-gray-600 dark:text-gray-400">Adres</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Ödeme</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Onay</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  📍 Teslimat Adresi
                </h2>

                {/* Saved Addresses */}
                {addresses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Kayıtlı Adreslerim
                    </h3>
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedAddress === address.id
                              ? 'border-green-500 bg-green-50 dark:bg-green-900'
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                          }`}
                          onClick={() => setSelectedAddress(address.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {address.title}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400">
                                {address.full_name} - {address.phone}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {address.address}, {address.district}, {address.city}
                              </p>
                            </div>
                            {address.is_default && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                Varsayılan
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    />
                    <input
                      type="text"
                      placeholder="Ad Soyad"
                      value={newAddress.full_name}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, full_name: e.target.value }))}
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    />
                    <input
                      type="tel"
                      placeholder="Telefon"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    />
                    <select
                      value={newAddress.city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    >
                      <option value="">Şehir Seçin</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                    <select
                      value={newAddress.district}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, district: e.target.value }))}
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
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
                      className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    />
                    <textarea
                      placeholder="Detaylı adres"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                      className="md:col-span-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 rows-3"
                    />
                  </div>
                  <button
                    onClick={saveNewAddress}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Adresi Kaydet
                  </button>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedAddress}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Devam Et →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  💳 Ödeme Yöntemi
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPayment?.id === method.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900'
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                      }`}
                      onClick={() => setSelectedPayment(method)}
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {method.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {method.type === 'iban' && '🏦 Banka Havalesi/EFT'}
                        {method.type === 'btc' && '₿ Bitcoin'}
                        {method.type === 'eth' && '⟠ Ethereum'}
                        {method.type === 'usdt_trc20' && '💲 USDT (TRC-20)'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sipariş Notu (Opsiyonel)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Özel istekleriniz varsa buraya yazabilirsiniz..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 rows-3"
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ← Geri
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={!selectedPayment}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Devam Et →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  ✅ Sipariş Onayı
                </h2>

                {/* Address Summary */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    📍 Teslimat Adresi
                  </h3>
                  {selectedAddress && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      {(() => {
                        const addr = addresses.find(a => a.id === selectedAddress);
                        return addr ? (
                          <>
                            <p className="font-medium">{addr.title}</p>
                            <p>{addr.full_name} - {addr.phone}</p>
                            <p>{addr.address}, {addr.district}, {addr.city}</p>
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Payment Summary */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    💳 Ödeme Yöntemi
                  </h3>
                  {selectedPayment && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="font-medium">{selectedPayment.title}</p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    🛒 Sipariş İçeriği
                  </h3>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between py-2">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} ₺</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ← Geri
                  </button>
                  <button
                    onClick={createOrder}
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sipariş Oluşturuluyor...' : '🚀 Siparişi Onayla'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📋 Sipariş Özeti
              </h3>

              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {(item.price * item.quantity).toFixed(2)} ₺
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ara Toplam:</span>
                  <span className="text-gray-900 dark:text-white">{getSubtotal().toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Kargo:</span>
                  <span className="text-gray-900 dark:text-white">
                    {getShippingCost() === 0 ? 'Ücretsiz' : `${getShippingCost()} ₺`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span className="text-gray-900 dark:text-white">Toplam:</span>
                  <span className="text-green-600 dark:text-green-400">{getTotal().toFixed(2)} ₺</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  🔒 Güvenli ödeme sistemi ile korumalı alışveriş
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCheckout;