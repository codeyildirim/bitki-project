import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Leaf, Key, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateNickname, validatePassword } from '../../utils/helpers';

const RecoverPassword = () => {
  const { recoverPassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nickname: '',
    recoveryCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newRecoveryCode, setNewRecoveryCode] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const nicknameError = validateNickname(formData.nickname);
    if (nicknameError) newErrors.nickname = nicknameError;

    if (!formData.recoveryCode.trim()) {
      newErrors.recoveryCode = 'Kurtarma kodu gereklidir';
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await recoverPassword(formData);
      if (result.success) {
        setNewRecoveryCode(result.newRecoveryCode);
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Şifre kurtarma hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/auth/login');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Şifre Sıfırlandı!
              </h2>
              <p className="text-gray-600">
                Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.
              </p>
            </div>

            {newRecoveryCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Yeni Kurtarma Kodunuz:
                </h3>
                <div className="bg-white border rounded-lg p-3 font-mono text-lg font-bold text-center tracking-wide">
                  {newRecoveryCode}
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Bu kodu güvenli bir yerde saklayın. Tekrar şifrenizi unutursanız bu kodu kullanabilirsiniz.
                </p>
              </div>
            )}

            <button
              onClick={handleContinue}
              className="w-full btn btn-primary py-3"
            >
              Giriş Sayfasına Dön
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link to="/" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">
            <Leaf className="w-8 h-8" />
            <span className="text-2xl font-bold">Şifalı Bitkiler</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Şifre Kurtarma
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Kurtarma kodunuz ile yeni şifre belirleyin
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                Nickname
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                value={formData.nickname}
                onChange={handleChange}
                className={`input ${errors.nickname ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Nickname girin"
              />
              {errors.nickname && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.nickname}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="recoveryCode" className="block text-sm font-medium text-gray-700 mb-2">
                Kurtarma Kodu
              </label>
              <input
                id="recoveryCode"
                name="recoveryCode"
                type="text"
                value={formData.recoveryCode}
                onChange={handleChange}
                className={`input font-mono ${errors.recoveryCode ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Kayıt sırasında aldığınız kurtarma kodu"
              />
              {errors.recoveryCode && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.recoveryCode}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`input pr-12 ${errors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.newPassword}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre Tekrarı
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pr-12 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Yeni şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 text-base font-medium rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="loading-spinner w-5 h-5" />
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  <span>Şifreyi Sıfırla</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/auth/login"
              className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Giriş sayfasına dön</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-xs text-gray-500"
        >
          <p>
            Kurtarma kodunuz yoksa, müşteri hizmetleri ile iletişime geçin.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RecoverPassword;