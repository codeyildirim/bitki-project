import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrokenCircleCaptcha from '../../components/common/BrokenCircleCaptcha';

const SimpleLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nickname: '',
    password: ''
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

    if (!formData.nickname || !formData.password) {
      setError('Kullanıcı adı ve şifre gerekli');
      return;
    }

    if (!captchaToken) {
      setError('Lütfen güvenlik doğrulamasını tamamlayın');
      return;
    }

    setIsLoading(true);

    try {
      // Send captchaToken with login request
      const result = await login(formData.nickname, formData.password, captchaToken);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Giriş başarısız');
        // Reset CAPTCHA on failed login
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
          <h1 className="text-3xl font-bold text-green-800 mb-2">🌿 Giriş Yap</h1>
          <p className="text-gray-600">Hesabınıza giriş yapın</p>
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
              Şifre
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Şifrenizi girin"
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
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <Link
              to="/auth/recover"
              className="text-green-600 hover:text-green-700 text-sm"
            >
              Şifremi unuttum
            </Link>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Hesabınız yok mu?{' '}
              <Link to="/auth/register" className="text-green-600 hover:text-green-700 font-medium">
                Kayıt olun
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
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

export default SimpleLogin;