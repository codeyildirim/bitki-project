import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  MapPin,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  User,
  Phone,
  Home,
  Building
} from 'lucide-react';

const RickCheckout = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [orderData, setOrderData] = useState({
    shipping: {
      method: 'cargo', // cargo, courier
      price: 0
    },
    address: {
      firstName: '',
      lastName: '',
      phone: '',
      city: '',
      district: '',
      fullAddress: '',
      buildingNo: '',
      apartmentNo: ''
    },
    payment: {
      method: 'iban', // iban, crypto
      ibanInfo: {
        accountHolder: '',
        iban: ''
      },
      cryptoInfo: {
        walletAddress: '',
        currency: 'BTC' // BTC, ETH, etc.
      }
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login?redirect=/checkout');
      return;
    }

    // Sepet verilerini yükle
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);

    if (cart.length === 0) {
      navigate('/cart');
    }

    // Kullanıcı bilgilerini ön doldur
    if (user) {
      setOrderData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || ''
        }
      }));
    }
  }, [isAuthenticated, navigate, user]);

  const calculateTotal = () => {
    const itemsTotal = cartItems.reduce((total, item) => {
      const price = item.discounted_price || item.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);
    return itemsTotal + orderData.shipping.price;
  };

  const handleShippingMethodChange = (method) => {
    const shippingPrices = {
      cargo: 0, // Ücretsiz kargo
      courier: 25 // Kurye ücreti
    };

    setOrderData(prev => ({
      ...prev,
      shipping: {
        method,
        price: shippingPrices[method]
      }
    }));
  };

  const handleAddressChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handlePaymentChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        [field]: value
      }
    }));
  };

  const handlePaymentInfoChange = (type, field, value) => {
    setOrderData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        [type]: {
          ...prev.payment[type],
          [field]: value
        }
      }
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return orderData.shipping.method !== '';
      case 2:
        const { firstName, lastName, phone, city, district, fullAddress } = orderData.address;
        return firstName && lastName && phone && city && district && fullAddress;
      case 3:
        if (orderData.payment.method === 'iban') {
          return orderData.payment.ibanInfo.accountHolder && orderData.payment.ibanInfo.iban;
        } else if (orderData.payment.method === 'crypto') {
          return orderData.payment.cryptoInfo.walletAddress && orderData.payment.cryptoInfo.currency;
        }
        return false;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOrder = async () => {
    if (!validateStep(3)) return;

    try {
      // Sipariş verme logic'i burada olacak
      console.log('Sipariş verildi:', {
        items: cartItems,
        ...orderData,
        total: calculateTotal()
      });

      // Sepeti temizle
      localStorage.removeItem('cart');

      // Başarı sayfasına yönlendir
      navigate('/order-success');
    } catch (error) {
      console.error('Sipariş hatası:', error);
    }
  };

  const steps = [
    { number: 1, title: 'Kargo/Kurye Seçimi', icon: Truck },
    { number: 2, title: 'Adres Bilgileri', icon: MapPin },
    { number: 3, title: 'Ödeme Yöntemi', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen relative z-0">
      <div className="relative z-0 min-h-screen backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          {/* Başlık */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-heading font-bold text-white drop-shadow-2xl mb-4">
              Siparişi Tamamla
            </h1>
            <p className="text-lg font-sans text-gray-100 drop-shadow-lg">
              Birkaç adımda siparişinizi tamamlayın
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex justify-center items-center space-x-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex flex-col items-center ${
                      isActive ? 'text-rick-green' :
                      isCompleted ? 'text-rick-purple' : 'text-gray-400'
                    }`}>
                      <div className={`w-12 h-12 rounded-none flex items-center justify-center border-2 mb-2 transition-all duration-300 ${
                        isActive ? 'bg-rick-green border-rick-green text-white scale-110' :
                        isCompleted ? 'bg-rick-purple border-rick-purple text-white' :
                        'bg-white/20 border-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <span className="text-sm font-heading font-semibold text-white">
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-4 ${
                        currentStep > step.number ? 'bg-rick-purple' : 'bg-gray-400'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol Taraf - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-none border-b-4 border-rick-green p-8">

                {/* Step 1: Kargo/Kurye Seçimi */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                      Teslimat Yöntemini Seçin
                    </h2>
                    <div className="space-y-3 sm:space-y-4">
                      <label className={`block p-3 sm:p-4 rounded-none border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        orderData.shipping.method === 'cargo'
                          ? 'border-rick-green bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 hover:border-rick-green'
                      }`}>
                        <input
                          type="radio"
                          name="shipping"
                          value="cargo"
                          checked={orderData.shipping.method === 'cargo'}
                          onChange={() => handleShippingMethodChange('cargo')}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Truck className="w-6 h-6 text-rick-green" />
                            <div>
                              <div className="font-heading font-semibold text-gray-900 dark:text-white">
                                Kargo ile Teslimat
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                                3-5 iş günü içinde teslimat
                              </div>
                            </div>
                          </div>
                          <div className="text-rick-green font-heading font-bold">
                            ÜCRETSİZ
                          </div>
                        </div>
                      </label>

                      <label className={`block p-4 rounded-none border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        orderData.shipping.method === 'courier'
                          ? 'border-rick-green bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 hover:border-rick-green'
                      }`}>
                        <input
                          type="radio"
                          name="shipping"
                          value="courier"
                          checked={orderData.shipping.method === 'courier'}
                          onChange={() => handleShippingMethodChange('courier')}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <User className="w-6 h-6 text-rick-purple" />
                            <div>
                              <div className="font-heading font-semibold text-gray-900 dark:text-white">
                                Kurye ile Teslimat
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                                Aynı gün teslimat (şehir içi)
                              </div>
                            </div>
                          </div>
                          <div className="text-rick-purple font-heading font-bold">
                            ₺25
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 2: Adres Bilgileri */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                      Teslimat Adres Bilgileri
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Ad *
                        </label>
                        <input
                          type="text"
                          value={orderData.address.firstName}
                          onChange={(e) => handleAddressChange('firstName', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-none focus:border-rick-green font-sans"
                          placeholder="Adınız"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Soyad *
                        </label>
                        <input
                          type="text"
                          value={orderData.address.lastName}
                          onChange={(e) => handleAddressChange('lastName', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-none focus:border-rick-green font-sans"
                          placeholder="Soyadınız"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Telefon *
                        </label>
                        <input
                          type="tel"
                          value={orderData.address.phone}
                          onChange={(e) => handleAddressChange('phone', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-none focus:border-rick-green font-sans"
                          placeholder="05XX XXX XX XX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Şehir *
                        </label>
                        <input
                          type="text"
                          value={orderData.address.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-none focus:border-rick-green font-sans"
                          placeholder="İstanbul"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          İlçe *
                        </label>
                        <input
                          type="text"
                          value={orderData.address.district}
                          onChange={(e) => handleAddressChange('district', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-none focus:border-rick-green font-sans"
                          placeholder="Kadıköy"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Bina No
                        </label>
                        <input
                          type="text"
                          value={orderData.address.buildingNo}
                          onChange={(e) => handleAddressChange('buildingNo', e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-none focus:border-rick-green font-sans"
                          placeholder="12A"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Tam Adres *
                        </label>
                        <textarea
                          value={orderData.address.fullAddress}
                          onChange={(e) => handleAddressChange('fullAddress', e.target.value)}
                          rows="3"
                          className="w-full p-3 border-2 border-gray-300 rounded-none focus:border-rick-green font-sans"
                          placeholder="Mahalle, sokak, cadde bilgileri..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Ödeme Yöntemi */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                      Ödeme Yöntemini Seçin
                    </h2>

                    {/* Ödeme Yöntemi Seçimi */}
                    <div className="space-y-4 mb-6">
                      <label className={`block p-4 rounded-none border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        orderData.payment.method === 'iban'
                          ? 'border-rick-green bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 hover:border-rick-green'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="iban"
                          checked={orderData.payment.method === 'iban'}
                          onChange={(e) => handlePaymentChange('method', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-3">
                          <Building className="w-6 h-6 text-rick-green" />
                          <div>
                            <div className="font-heading font-semibold text-gray-900 dark:text-white">
                              IBAN ile Ödeme
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                              Banka hesabınızdan direkt transfer
                            </div>
                          </div>
                        </div>
                      </label>

                      <label className={`block p-4 rounded-none border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        orderData.payment.method === 'crypto'
                          ? 'border-rick-green bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 hover:border-rick-green'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="crypto"
                          checked={orderData.payment.method === 'crypto'}
                          onChange={(e) => handlePaymentChange('method', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 text-rick-purple">₿</div>
                          <div>
                            <div className="font-heading font-semibold text-gray-900 dark:text-white">
                              Kripto Para ile Ödeme
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                              Bitcoin, Ethereum ve diğer kripto paralar
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* IBAN Bilgileri */}
                    {orderData.payment.method === 'iban' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
                          IBAN Bilgileri
                        </h3>
                        <div>
                          <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Hesap Sahibi *
                          </label>
                          <input
                            type="text"
                            value={orderData.payment.ibanInfo.accountHolder}
                            onChange={(e) => handlePaymentInfoChange('ibanInfo', 'accountHolder', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-none focus:border-rick-green font-sans"
                            placeholder="Ali Veli"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            IBAN Numarası *
                          </label>
                          <input
                            type="text"
                            value={orderData.payment.ibanInfo.iban}
                            onChange={(e) => handlePaymentInfoChange('ibanInfo', 'iban', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-none focus:border-rick-green font-sans"
                            placeholder="TR00 0000 0000 0000 0000 0000 00"
                          />
                        </div>
                      </div>
                    )}

                    {/* Kripto Bilgileri */}
                    {orderData.payment.method === 'crypto' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
                          Kripto Para Bilgileri
                        </h3>
                        <div>
                          <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Kripto Para Türü *
                          </label>
                          <select
                            value={orderData.payment.cryptoInfo.currency}
                            onChange={(e) => handlePaymentInfoChange('cryptoInfo', 'currency', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-none focus:border-rick-green font-sans"
                          >
                            <option value="BTC">Bitcoin (BTC)</option>
                            <option value="ETH">Ethereum (ETH)</option>
                            <option value="USDT">Tether (USDT)</option>
                            <option value="BNB">Binance Coin (BNB)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Cüzdan Adresi *
                          </label>
                          <input
                            type="text"
                            value={orderData.payment.cryptoInfo.walletAddress}
                            onChange={(e) => handlePaymentInfoChange('cryptoInfo', 'walletAddress', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-none focus:border-rick-green font-sans"
                            placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-none hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-heading font-semibold"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Geri</span>
                  </button>

                  {currentStep < 3 ? (
                    <button
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      className="flex items-center space-x-2 bg-rick-green text-white px-6 py-3 rounded-none hover:bg-green-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-heading font-semibold"
                    >
                      <span>İleri</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={completeOrder}
                      disabled={!validateStep(currentStep)}
                      className="flex items-center space-x-2 bg-rick-purple text-white px-8 py-3 rounded-none hover:bg-purple-600 hover:scale-105 hover:animate-slime-drip disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-heading font-semibold text-lg"
                    >
                      <span>Siparişi Tamamla</span>
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sağ Taraf - Sipariş Özeti */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-none border-b-4 border-rick-purple p-6 sticky top-8">
                <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                  Sipariş Özeti
                </h3>

                {/* Ürünler */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-none">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-none overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-rick-green">🌿</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-heading font-semibold text-sm text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-sans">
                          {item.quantity} adet × ₺{(item.discounted_price || item.price || 0).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Toplam */}
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between font-sans">
                    <span className="text-gray-600 dark:text-gray-400">Ürünler:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₺{(calculateTotal() - orderData.shipping.price).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span className="text-gray-600 dark:text-gray-400">Teslimat:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {orderData.shipping.price === 0 ? 'Ücretsiz' : `₺${orderData.shipping.price}`}
                    </span>
                  </div>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <div className="flex justify-between text-xl">
                    <span className="font-heading font-bold text-gray-900 dark:text-white">Toplam:</span>
                    <span className="font-heading font-bold text-rick-green">
                      ₺{calculateTotal().toLocaleString('tr-TR')}
                    </span>
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

export default RickCheckout;