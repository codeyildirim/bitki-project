import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, MapPin, CreditCard, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const EnhancedCheckout = () => {
  const { } = useAuth();
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
      <div className="min-h-screen relative z-0">
        <div className="relative z-0 min-h-screen backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-float">🛒</div>
            <p className="text-xl font-sans text-white">Ödeme sayfası yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen relative z-0">
        <div className="relative z-0 min-h-screen backdrop-blur-sm py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-none border-b-4 border-rick-green max-w-md mx-auto">
              <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6 text-rick-green animate-bounce-slow">🛒</div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Sepetiniz Boş
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-sans mb-4 sm:mb-6">
                Sipariş verebilmek için sepetinizde ürün olması gerekiyor.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="w-full sm:w-auto bg-rick-green text-white px-6 sm:px-8 py-3 sm:py-4 rounded-none hover:scale-105 hover:animate-slime-drip transition-all duration-300 font-heading font-semibold text-base sm:text-lg"
              >
                Alışverişe Başla
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-0">
      <div className="relative z-0 min-h-screen backdrop-blur-sm py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-4">
        {/* Başlık */}
        <div className="text-center mb-6 sm:mb-8 px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white drop-shadow-2xl mb-3 sm:mb-4 animate-float">
            Ödeme İşlemi
          </h1>
          <p className="text-base sm:text-lg font-sans text-gray-100 drop-shadow-lg">
            Siparişinizi güvenli bir şekilde tamamlayın
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8 px-4">
          <div className="flex items-center justify-center">
            {[
              { num: 1, icon: MapPin, label: 'Adres' },
              { num: 2, icon: CreditCard, label: 'Ödeme' },
              { num: 3, icon: CheckCircle, label: 'Onay' }
            ].map((step, index) => (
              <React.Fragment key={step.num}>
                <div className={`flex flex-col items-center space-y-2`}>
                  <div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-none border-2 ${
                    currentStep >= step.num
                      ? 'bg-rick-green border-rick-green text-white'
                      : 'bg-white/90 border-gray-300 text-gray-600'
                  } transition-all duration-300`}>
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className={`text-xs sm:text-sm font-heading font-medium ${
                    currentStep >= step.num ? 'text-rick-green' : 'text-white'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-12 sm:w-20 h-1 mx-2 sm:mx-4 mb-6 ${
                    currentStep > step.num ? 'bg-rick-green' : 'bg-gray-300'
                  } transition-all duration-300`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-none border-b-4 border-rick-green p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-rick-green" />
                  <span>Teslimat Adresi</span>
                </h2>

                {/* Saved Addresses */}
                {addresses.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                      Kayıtlı Adreslerim
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border-2 rounded-none p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                            selectedAddress === address.id
                              ? 'border-rick-green bg-rick-green/10 dark:bg-rick-green/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-rick-green/50'
                          }`}
                          onClick={() => setSelectedAddress(address.id)}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-1">
                              <h4 className="font-heading font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                {address.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-sans">
                                {address.full_name} - {address.phone}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-sans">
                                {address.address}, {address.district}, {address.city}
                              </p>
                            </div>
                            {address.is_default && (
                              <span className="bg-rick-purple text-white px-2 py-1 rounded-none text-xs font-heading font-semibold w-fit">
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
                  <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                    Yeni Adres Ekle
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      type="text"
                      placeholder="Adres başlığı (Ev, İş vb.)"
                      value={newAddress.title}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, title: e.target.value }))}
                      className="p-2 sm:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 text-sm sm:text-base font-sans focus:border-rick-green transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Ad Soyad"
                      value={newAddress.full_name}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, full_name: e.target.value }))}
                      className="p-2 sm:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 text-sm sm:text-base font-sans focus:border-rick-green transition-colors"
                    />
                    <input
                      type="tel"
                      placeholder="Telefon"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                      className="p-2 sm:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 text-sm sm:text-base font-sans focus:border-rick-green transition-colors"
                    />
                    <select
                      value={newAddress.city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="p-2 sm:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 text-sm sm:text-base font-sans focus:border-rick-green transition-colors"
                    >
                      <option value="">Şehir Seçin</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                    <select
                      value={newAddress.district}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, district: e.target.value }))}
                      className="p-2 sm:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 text-sm sm:text-base font-sans focus:border-rick-green transition-colors"
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
                      className="p-2 sm:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 text-sm sm:text-base font-sans focus:border-rick-green transition-colors"
                    />
                    <textarea
                      placeholder="Detaylı adres"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                      className="sm:col-span-2 p-2 sm:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 text-sm sm:text-base font-sans focus:border-rick-green transition-colors"
                      rows="3"
                    />
                  </div>
                  <button
                    onClick={saveNewAddress}
                    className="mt-3 sm:mt-4 bg-rick-purple text-white px-4 sm:px-6 py-2 sm:py-3 rounded-none hover:bg-purple-600 hover:scale-105 transition-all duration-300 font-heading font-semibold text-sm sm:text-base"
                  >
                    Adresi Kaydet
                  </button>
                </div>

                <div className="flex justify-end mt-4 sm:mt-6">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedAddress}
                    className="bg-rick-green text-white px-4 sm:px-6 py-2 sm:py-3 rounded-none hover:bg-green-600 hover:scale-105 hover:animate-slime-drip transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-heading font-semibold text-sm sm:text-base flex items-center space-x-2"
                  >
                    <span>Devam Et</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-none border-b-4 border-rick-purple p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-rick-purple" />
                  <span>Ödeme Yöntemi</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border-2 rounded-none p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedPayment?.id === method.id
                          ? 'border-rick-purple bg-rick-purple/10 dark:bg-rick-purple/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-rick-purple/50'
                      }`}
                      onClick={() => setSelectedPayment(method)}
                    >
                      <h3 className="font-heading font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        {method.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-sans">
                        {method.type === 'iban' && '🏦 Banka Havalesi/EFT'}
                        {method.type === 'btc' && '₿ Bitcoin'}
                        {method.type === 'eth' && '⟠ Ethereum'}
                        {method.type === 'usdt_trc20' && '💲 USDT (TRC-20)'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 sm:mt-6">
                  <label className="block text-sm sm:text-base font-heading font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sipariş Notu (Opsiyonel)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Özel istekleriniz varsa buraya yazabilirsiniz..."
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 text-sm sm:text-base font-sans focus:border-rick-purple transition-colors"
                    rows="3"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-none hover:bg-gray-700 hover:scale-105 transition-all duration-300 font-heading font-semibold text-sm sm:text-base flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Geri</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={!selectedPayment}
                    className="bg-rick-green text-white px-4 sm:px-6 py-2 sm:py-3 rounded-none hover:bg-green-600 hover:scale-105 hover:animate-slime-drip transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-heading font-semibold text-sm sm:text-base flex items-center justify-center space-x-2"
                  >
                    <span>Devam Et</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-none border-b-4 border-rick-pink p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rick-pink" />
                  <span>Sipariş Onayı</span>
                </h2>

                {/* Address Summary */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-rick-green" />
                    <span>Teslimat Adresi</span>
                  </h3>
                  {selectedAddress && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-none border-l-4 border-rick-green">
                      {(() => {
                        const addr = addresses.find(a => a.id === selectedAddress);
                        return addr ? (
                          <>
                            <p className="font-heading font-medium text-sm sm:text-base">{addr.title}</p>
                            <p className="text-xs sm:text-sm font-sans text-gray-600 dark:text-gray-400">{addr.full_name} - {addr.phone}</p>
                            <p className="text-xs sm:text-sm font-sans text-gray-600 dark:text-gray-400">{addr.address}, {addr.district}, {addr.city}</p>
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Payment Summary */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-rick-purple" />
                    <span>Ödeme Yöntemi</span>
                  </h3>
                  {selectedPayment && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-none border-l-4 border-rick-purple">
                      <p className="font-heading font-medium text-sm sm:text-base">{selectedPayment.title}</p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base flex items-center space-x-2">
                    <ShoppingBag className="w-4 h-4 text-rick-pink" />
                    <span>Sipariş İçeriği</span>
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-none border-l-4 border-rick-pink">
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between py-1 sm:py-2 text-xs sm:text-sm">
                          <span className="font-sans text-gray-700 dark:text-gray-300">{item.name} x{item.quantity}</span>
                          <span className="font-heading font-semibold text-rick-green">{(item.price * item.quantity).toFixed(2)} ₺</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-none hover:bg-gray-700 hover:scale-105 transition-all duration-300 font-heading font-semibold text-sm sm:text-base flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Geri</span>
                  </button>
                  <button
                    onClick={createOrder}
                    disabled={isSubmitting}
                    className="bg-rick-green text-white px-4 sm:px-6 py-2 sm:py-3 rounded-none hover:bg-green-600 hover:scale-105 hover:animate-slime-drip transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-heading font-semibold text-sm sm:text-base flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sipariş Oluşturuluyor...' : 'Siparişi Onayla'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-none border-b-4 border-rick-green p-4 sm:p-6 lg:sticky lg:top-8">
              <h3 className="text-base sm:text-lg lg:text-xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-rick-green" />
                <span>Sipariş Özeti</span>
              </h3>

              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-sans">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-gray-900 dark:text-white font-heading font-semibold">
                      {(item.price * item.quantity).toFixed(2)} ₺
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-sans">Ara Toplam:</span>
                  <span className="text-gray-900 dark:text-white font-heading font-semibold">{getSubtotal().toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-sans">Kargo:</span>
                  <span className="text-rick-green font-heading font-semibold">
                    {getShippingCost() === 0 ? 'Ücretsiz' : `${getShippingCost()} ₺`}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-heading font-bold pt-2 border-t-2 border-rick-green">
                  <span className="text-gray-900 dark:text-white">Toplam:</span>
                  <span className="text-rick-green">{getTotal().toFixed(2)} ₺</span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-rick-green/10 dark:bg-rick-green/20 rounded-none border-l-4 border-rick-green">
                <p className="text-xs sm:text-sm text-rick-green font-sans flex items-center space-x-2">
                  <span>🔒</span>
                  <span>Güvenli ödeme sistemi ile korumalı alışveriş</span>
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