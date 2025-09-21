import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrokenCircleCaptcha from '../../components/common/BrokenCircleCaptcha';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nickname: '',
    password: '',
    confirmPassword: '',
    city: 'İstanbul'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');

    // Şifre eşleşme kontrolü (anlık)
    if ((name === 'password' || name === 'confirmPassword')) {
      const currentPassword = name === 'password' ? value : formData.password;
      const currentConfirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;

      const p1 = (currentPassword ?? '').normalize('NFC').trim();
      const p2 = (currentConfirmPassword ?? '').normalize('NFC').trim();

      if (p1 && p2 && p1 !== p2) {
        setError('Şifreler eşleşmiyor');
      } else if (error === 'Şifreler eşleşmiyor') {
        setError('');
      }
    }
  };

  const handleCaptchaVerified = (token) => {
    setCaptchaToken(token);
  };

  const handleCaptchaError = () => {
    setCaptchaToken(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Şifreleri normalize ve trim ile temizle
    const p1 = (formData.password ?? '').normalize('NFC').trim();
    const p2 = (formData.confirmPassword ?? '').normalize('NFC').trim();
    const cleanNickname = formData.nickname?.trim() || '';
    const cleanCity = formData.city?.trim() || '';

    // Basit validasyon
    if (!cleanNickname || !p1 || !p2) {
      setError('Tüm alanları doldurun');
      return;
    }

    if (p1 !== p2) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (p1.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }

    if (!captchaToken) {
      setError('Lütfen güvenlik doğrulamasını tamamlayın');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        nickname: cleanNickname,
        password: p1,
        confirmPassword: p2,
        city: cleanCity,
        captchaToken // Include CAPTCHA token
      };

      const result = await register(payload);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Kayıt başarısız');
        // Reset CAPTCHA on failed registration
        setCaptchaToken(null);
      }
    } catch (err) {
      setError('Bir hata oluştu');
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">🌿 Kayıt Ol</h1>
          <p className="text-gray-600">Şifalı bitkiler dünyasına katılın</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Kullanıcı adınızı girin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şehir
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="İstanbul">İstanbul</option>
              <option value="Ankara">Ankara</option>
              <option value="İzmir">İzmir</option>
              <option value="Bursa">Bursa</option>
              <option value="Antalya">Antalya</option>
              <option value="Adana">Adana</option>
              <option value="Konya">Konya</option>
              <option value="Gaziantep">Gaziantep</option>
              <option value="Mersin">Mersin</option>
              <option value="Kayseri">Kayseri</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="En az 6 karakter"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre Tekrar
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Şifrenizi tekrar girin"
              required
            />
          </div>

          {/* Broken Circle CAPTCHA */}
          <BrokenCircleCaptcha
            onVerified={handleCaptchaVerified}
            onError={handleCaptchaError}
          />

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !captchaToken}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
          >
            {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link to="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
              Giriş yapın
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;