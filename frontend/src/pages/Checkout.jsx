import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [districts, setDistricts] = useState([]);
  const [orderData, setOrderData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    paymentMethod: 'bank'
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      if (data.success) {
        setCities(data.data);
      }
    } catch (error) {
      console.error('Şehirler yüklenemedi:', error);
    }
  };

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    const city = cities.find(c => c.name === cityName);
    setDistricts(city ? city.districts : []);
    setOrderData({ ...orderData, city: cityName, district: '' });
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Sipariş oluşturma logic'i
    console.log('Sipariş verildi:', { orderData, cartItems });
    navigate('/orders');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-8">💳 Ödeme</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-6">Teslimat Bilgileri</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ad</label>
                <input
                  type="text"
                  required
                  value={orderData.firstName}
                  onChange={(e) => setOrderData({...orderData, firstName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Soyad</label>
                <input
                  type="text"
                  required
                  value={orderData.lastName}
                  onChange={(e) => setOrderData({...orderData, lastName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon</label>
              <input
                type="tel"
                required
                value={orderData.phone}
                onChange={(e) => setOrderData({...orderData, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Şehir</label>
                <select
                  required
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Şehir seçin</option>
                  {cities.map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">İlçe</label>
                <select
                  required
                  value={orderData.district}
                  onChange={(e) => setOrderData({...orderData, district: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  disabled={!selectedCity}
                >
                  <option value="">İlçe seçin</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Açık Adres</label>
              <textarea
                required
                value={orderData.address}
                onChange={(e) => setOrderData({...orderData, address: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4">Ödeme Yöntemi</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={orderData.paymentMethod === 'bank'}
                    onChange={(e) => setOrderData({...orderData, paymentMethod: e.target.value})}
                    className="text-green-600"
                  />
                  <span>🏦 Banka Transferi (IBAN)</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="crypto"
                    checked={orderData.paymentMethod === 'crypto'}
                    onChange={(e) => setOrderData({...orderData, paymentMethod: e.target.value})}
                    className="text-green-600"
                  />
                  <span>🪙 Kripto Para</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Siparişi Onayla
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-6">Sipariş Özeti</h2>
          <div className="space-y-4 mb-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xl">🌿</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">Adet: {item.quantity}</div>
                </div>
                <div className="font-bold">
                  {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Ara Toplam:</span>
              <span>{getTotalPrice().toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>Kargo:</span>
              <span className="text-green-600">Bedava</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Toplam:</span>
              <span className="text-green-600">{getTotalPrice().toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;