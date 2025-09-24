import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrokenCircleCaptcha from '../../components/common/BrokenCircleCaptcha';
import { API_CONFIG } from '../../config/api.js';

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
  const [nicknameStatus, setNicknameStatus] = useState('idle'); // 'idle', 'checking', 'available', 'taken'

  // Debounced nickname kontrolü
  useEffect(() => {
    const checkNickname = async (nickname) => {
      if (!nickname || nickname.length < 3) {
        setNicknameStatus('idle');
        return;
      }

      setNicknameStatus('checking');

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/check-nickname`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nickname })
        });

        if (response.ok) {
          const result = await response.json();
          setNicknameStatus(result.available ? 'available' : 'taken');
        } else {
          setNicknameStatus('idle');
        }
      } catch (error) {
        console.log('Nick kontrolü yapılamadı:', error);
        setNicknameStatus('idle');
      }
    };

    const timeoutId = setTimeout(() => {
      const nickname = formData.nickname?.trim();
      if (nickname && nickname !== '' && nicknameStatus !== 'checking') {
        checkNickname(nickname);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.nickname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Herhangi bir alan değiştiğinde backend hatalarını temizle
    setError('');

    // Nickname değiştiğinde önceki backend hatalarını tamamen sıfırla
    if (name === 'nickname') {
      setError('');
      setNicknameStatus('idle'); // Nick kontrolünü sıfırla
      // CAPTCHA'yı resetleme, çünkü kullanıcı sadece nick değiştiriyor
    }

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

  // Form validasyonu için helper fonksiyon
  const isFormValid = () => {
    const p1 = (formData.password ?? '').normalize('NFC').trim();
    const p2 = (formData.confirmPassword ?? '').normalize('NFC').trim();
    const cleanNickname = formData.nickname?.trim() || '';

    return cleanNickname &&
           p1 &&
           p2 &&
           p1 === p2 &&
           p1.length >= 6 &&
           captchaToken &&
           nicknameStatus === 'available' && // Nickname kullanılabilir olmalı
           !isLoading;
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
        // Nick hatası varsa CAPTCHA'yı resetleme, kullanıcı düzeltip tekrar denesin
        // Sadece diğer hatalarda CAPTCHA'yı resetle
        if (!result.message || !result.message.includes('nickname')) {
          setCaptchaToken(null);
        }
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
            <div className="relative">
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:border-transparent ${
                  nicknameStatus === 'taken' ? 'border-red-300 focus:ring-red-500' :
                  nicknameStatus === 'available' ? 'border-green-300 focus:ring-green-500' :
                  'border-gray-300 focus:ring-green-500'
                }`}
                placeholder="Kullanıcı adınızı girin"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {nicknameStatus === 'checking' && (
                  <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                )}
                {nicknameStatus === 'available' && (
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
                {nicknameStatus === 'taken' && (
                  <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
              </div>
            </div>
            {nicknameStatus === 'taken' && (
              <p className="mt-1 text-sm text-red-600">Bu kullanıcı adı zaten kullanılıyor</p>
            )}
            {nicknameStatus === 'available' && (
              <p className="mt-1 text-sm text-green-600">Bu kullanıcı adı kullanılabilir</p>
            )}
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
            disabled={!isFormValid()}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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