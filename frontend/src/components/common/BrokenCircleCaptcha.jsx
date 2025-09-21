import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BrokenCircleCaptcha = ({ onVerified, onError }) => {
  const [captchaData, setCaptchaData] = useState(null);
  const [captchaId, setCaptchaId] = useState(null);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Load new CAPTCHA
  const loadCaptcha = async () => {
    setLoading(true);
    setSelectedCircle(null);
    setIsVerified(false);
    setAttempts(0);

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/captcha/new`);

      if (response.data.success) {
        setCaptchaData(response.data.data.circles);
        setCaptchaId(response.data.data.captchaId);
      } else {
        throw new Error('CAPTCHA yüklenemedi');
      }
    } catch (error) {
      console.error('CAPTCHA load error:', error);
      toast.error('CAPTCHA yüklenemedi. Sayfayı yenileyin.');
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  // Verify selected circle
  const handleCircleClick = async (circleId) => {
    if (isVerified || loading) return;

    setSelectedCircle(circleId);
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/captcha/verify`, {
        captchaId,
        selectedIndex: circleId
      });

      if (response.data.success) {
        setIsVerified(true);
        toast.success('CAPTCHA doğrulandı!');

        // Pass the verification token to parent
        if (onVerified) {
          onVerified(response.data.data.token);
        }
      }
    } catch (error) {
      console.error('CAPTCHA verification error:', error);

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        toast.error('Çok fazla yanlış deneme. Yeni CAPTCHA yükleniyor...');
        setTimeout(() => loadCaptcha(), 1500);
      } else {
        toast.error(error.response?.data?.message || `Yanlış seçim! ${3 - newAttempts} deneme hakkınız kaldı.`);
      }

      // Visual feedback for wrong selection
      setTimeout(() => setSelectedCircle(null), 1000);
    } finally {
      setLoading(false);
    }
  };

  // Load CAPTCHA on mount
  useEffect(() => {
    loadCaptcha();
  }, []);

  // Draw broken circle
  const renderCircle = (circle) => {
    const { isBroken, gapRotation, radius = 25 } = circle;

    if (!isBroken) {
      // Complete circle
      return (
        <circle
          cx={radius}
          cy={radius}
          r={radius - 2}
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
      );
    }

    // Broken circle with gap
    const gapSize = 30; // degrees
    const startAngle = gapRotation;
    const endAngle = gapRotation + (360 - gapSize);

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc path
    const x1 = radius + (radius - 2) * Math.cos(startRad);
    const y1 = radius + (radius - 2) * Math.sin(startRad);
    const x2 = radius + (radius - 2) * Math.cos(endRad);
    const y2 = radius + (radius - 2) * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return (
      <path
        d={`M ${x1} ${y1} A ${radius - 2} ${radius - 2} 0 ${largeArcFlag} 1 ${x2} ${y2}`}
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  if (!captchaData) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-900/50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        {/* Title */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-300 mb-1">Güvenlik Doğrulaması</h3>
          <p className="text-xs text-gray-400">
            {isVerified
              ? "✓ Doğrulama başarılı!"
              : "Kırık çemberi bulup tıklayın"}
          </p>
        </div>

        {/* CAPTCHA Area */}
        <div className="relative bg-gray-800/50 rounded-lg p-4" style={{ minHeight: '220px' }}>
          <div
            className="relative w-full h-48"
            style={{
              background: 'linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%)',
              borderRadius: '8px'
            }}
          >
            {captchaData.map((circle) => (
              <button
                key={circle.id}
                onClick={() => handleCircleClick(circle.id)}
                disabled={isVerified || loading}
                className={`
                  absolute transform -translate-x-1/2 -translate-y-1/2
                  transition-all duration-300 group
                  ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
                  ${selectedCircle === circle.id ? 'scale-110' : 'hover:scale-105'}
                  ${isVerified && selectedCircle === circle.id ? 'animate-pulse' : ''}
                `}
                style={{
                  left: `${circle.x}px`,
                  top: `${circle.y}px`,
                  width: `${(circle.radius || 25) * 2}px`,
                  height: `${(circle.radius || 25) * 2}px`,
                }}
              >
                <svg
                  width={`${(circle.radius || 25) * 2}`}
                  height={`${(circle.radius || 25) * 2}`}
                  className={`
                    transition-colors duration-300
                    ${selectedCircle === circle.id
                      ? (isVerified ? 'text-green-400' : 'text-red-400')
                      : 'text-gray-400 group-hover:text-gray-300'
                    }
                  `}
                >
                  {renderCircle(circle)}
                </svg>

                {/* Hover glow effect */}
                <div
                  className={`
                    absolute inset-0 rounded-full opacity-0 group-hover:opacity-20
                    transition-opacity duration-300 pointer-events-none
                    ${selectedCircle === circle.id
                      ? (isVerified ? 'bg-green-400' : 'bg-red-400')
                      : 'bg-gray-300'
                    }
                  `}
                  style={{
                    filter: 'blur(10px)',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Reload button and status */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={loadCaptcha}
            disabled={loading || isVerified}
            className={`
              text-xs px-3 py-1.5 rounded-md transition-all
              ${isVerified
                ? 'bg-green-600/20 text-green-400 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }
            `}
          >
            {isVerified ? '✓ Doğrulandı' : '↻ Yenile'}
          </button>

          {attempts > 0 && !isVerified && (
            <span className="text-xs text-orange-400">
              {3 - attempts} deneme hakkı kaldı
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokenCircleCaptcha;