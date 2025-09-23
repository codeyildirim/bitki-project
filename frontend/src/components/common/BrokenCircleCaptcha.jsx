import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Volume2, VolumeX } from 'lucide-react';

const BrokenCircleCaptcha = ({ onVerified, onError }) => {
  const [captchaData, setCaptchaData] = useState(null);
  const [captchaId, setCaptchaId] = useState(null);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [focusedCircleIndex, setFocusedCircleIndex] = useState(-1);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const captchaAreaRef = useRef(null);

  // Audio feedback for accessibility
  const playAudioFeedback = (type) => {
    if (!audioEnabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'focus':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e, circleId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCircleClick(circleId);
    }
  };

  // Load new CAPTCHA
  const loadCaptcha = async () => {
    setLoading(true);
    setSelectedCircle(null);
    setIsVerified(false);
    setAttempts(0);
    setFocusedCircleIndex(-1);

    try {
      // Backend API CAPTCHA generation
      console.log('🎯 CAPTCHA: Backend API CAPTCHA oluşturuluyor...');

      const API_URL = 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/captcha/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 CAPTCHA API yanıtı:', data);

      if (data.success) {
        const { captchaId, circles } = data.data;
        setCaptchaData(circles);
        setCaptchaId(captchaId);
        console.log('✅ CAPTCHA: Backend CAPTCHA hazır, ID:', captchaId);
      } else {
        throw new Error(data.message || 'CAPTCHA oluşturulamadı');
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
      // Backend API CAPTCHA verification
      console.log('🔍 CAPTCHA: Backend doğrulaması yapılıyor, seçilen:', circleId, 'captchaId:', captchaId);

      const API_URL = 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/captcha/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          captchaId: captchaId,
          selectedIndex: circleId
        }),
      });

      const data = await response.json();
      console.log('📡 CAPTCHA Verify API yanıtı:', data);

      if (response.ok && data.success) {
        setIsVerified(true);
        playAudioFeedback('success');
        toast.success('CAPTCHA doğrulandı!');

        // Get verification token from backend
        const verificationToken = data.data.token;

        // Pass the verification token to parent
        if (onVerified) {
          onVerified(verificationToken);
        }

        console.log('🎉 CAPTCHA: Doğrulama başarılı! Token:', verificationToken);

      } else {
        throw new Error(data.message || 'Yanlış seçim');
      }
    } catch (error) {
      console.error('CAPTCHA verification error:', error);

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      playAudioFeedback('error');

      if (newAttempts >= 3) {
        toast.error('Çok fazla yanlış deneme. Yeni CAPTCHA yükleniyor...');
        setTimeout(() => loadCaptcha(), 1500);
      } else {
        toast.error(`Yanlış seçim! ${3 - newAttempts} deneme hakkınız kaldı.`);
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
      <div className="flex items-center justify-center p-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
        <span className="ml-3 text-gray-300">CAPTCHA yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="w-full" role="region" aria-label="Güvenlik doğrulaması">
      <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border border-gray-600 shadow-2xl">
        {/* Title and Controls */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">
              Güvenlik Doğrulaması
            </h3>
            <p className="text-xs text-gray-400" id="captcha-instruction">
              {isVerified
                ? "✓ Doğrulama başarılı!"
                : "Kırık çemberi bulup tıklayın veya Enter/Space tuşlarını kullanın"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600 transition-colors"
              title={audioEnabled ? "Ses geri bildirimini kapat" : "Ses geri bildirimini aç"}
              aria-label={audioEnabled ? "Ses geri bildirimini kapat" : "Ses geri bildirimini aç"}
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4 text-green-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* CAPTCHA Area */}
        <div
          className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-4 border border-gray-700/50"
          style={{ minHeight: '240px' }}
          ref={captchaAreaRef}
          role="application"
          aria-describedby="captcha-instruction"
        >
          <div
            className="relative w-full h-52"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
              borderRadius: '12px',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            {captchaData.map((circle, index) => (
              <button
                key={circle.id}
                onClick={() => handleCircleClick(circle.id)}
                onKeyDown={(e) => handleKeyDown(e, circle.id)}
                onFocus={() => {
                  setFocusedCircleIndex(index);
                  playAudioFeedback('focus');
                }}
                onBlur={() => setFocusedCircleIndex(-1)}
                disabled={isVerified || loading}
                className={`
                  absolute transform -translate-x-1/2 -translate-y-1/2
                  transition-all duration-300 group focus:outline-none
                  ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
                  ${selectedCircle === circle.id ? 'scale-110 z-10' : 'hover:scale-105'}
                  ${isVerified && selectedCircle === circle.id ? 'animate-pulse' : ''}
                  ${focusedCircleIndex === index ? 'ring-2 ring-blue-400 ring-opacity-75' : ''}
                `}
                style={{
                  left: `${circle.x}px`,
                  top: `${circle.y}px`,
                  width: `${(circle.radius || 25) * 2}px`,
                  height: `${(circle.radius || 25) * 2}px`,
                }}
                role="button"
                tabIndex={0}
                aria-label={`Çember ${index + 1}${circle.isBroken ? ' (kırık)' : ' (tam)'}`}
                aria-pressed={selectedCircle === circle.id}
              >
                <svg
                  width={`${(circle.radius || 25) * 2}`}
                  height={`${(circle.radius || 25) * 2}`}
                  className={`
                    transition-all duration-300 drop-shadow-sm
                    ${selectedCircle === circle.id
                      ? (isVerified ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]')
                      : focusedCircleIndex === index
                        ? 'text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.4)]'
                        : 'text-gray-400 group-hover:text-gray-300'
                    }
                  `}
                >
                  {renderCircle(circle)}
                </svg>

                {/* Enhanced glow effects */}
                <div
                  className={`
                    absolute inset-0 rounded-full transition-all duration-300 pointer-events-none
                    ${selectedCircle === circle.id
                      ? (isVerified
                          ? 'bg-green-400/30 opacity-100 scale-110'
                          : 'bg-red-400/30 opacity-100 scale-110')
                      : focusedCircleIndex === index
                        ? 'bg-blue-400/20 opacity-100 scale-105'
                        : 'bg-gray-300/10 opacity-0 group-hover:opacity-100 group-hover:scale-105'
                    }
                  `}
                  style={{
                    filter: 'blur(8px)',
                  }}
                />

                {/* Focus ring for accessibility */}
                {focusedCircleIndex === index && (
                  <div
                    className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-75 animate-pulse pointer-events-none"
                    style={{ transform: 'scale(1.2)' }}
                  />
                )}
              </button>
            ))}

            {/* Ambient background pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
          </div>
        </div>

        {/* Footer with controls and status */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Reload button with enhanced styling */}
            <button
              onClick={loadCaptcha}
              disabled={loading || isVerified}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                ${isVerified
                  ? 'bg-green-600/20 text-green-400 cursor-not-allowed'
                  : loading
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:scale-105'
                }
              `}
              aria-label="CAPTCHA yenile"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              ) : isVerified ? (
                <span className="text-green-400">✓</span>
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="text-xs font-medium">
                {isVerified ? 'Doğrulandı' : loading ? 'Yükleniyor...' : 'Yenile'}
              </span>
            </button>

            {/* Progress indicator */}
            {!isVerified && (
              <div className="flex items-center space-x-1">
                {[1, 2, 3].map((attempt) => (
                  <div
                    key={attempt}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      attempts >= attempt ? 'bg-red-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status message */}
          <div className="text-right">
            {attempts > 0 && !isVerified && (
              <div className="text-xs">
                <span className="text-orange-400 font-medium">
                  {3 - attempts} deneme kaldı
                </span>
              </div>
            )}
            {isVerified && (
              <div className="text-xs">
                <span className="text-green-400 font-medium">
                  ✓ Başarıyla doğrulandı
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Accessibility info */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Klavye navigasyonu: Tab ile çember seçin, Enter/Space ile tıklayın
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrokenCircleCaptcha;