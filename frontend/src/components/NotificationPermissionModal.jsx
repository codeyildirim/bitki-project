import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPushNotifications
} from '../utils/pushNotifications.js';

const NotificationPermissionModal = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    checkShouldShow();
  }, []);

  const checkShouldShow = () => {
    // Check if push is supported
    if (!isPushSupported()) {
      console.log('🚫 Push not supported on this device');
      return;
    }

    // Check iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    const permission = getNotificationPermission();

    // Don't show if already granted
    if (permission === 'granted') {
      console.log('✅ Notification permission already granted');
      return;
    }

    // Check if user previously denied
    const deniedAt = localStorage.getItem('notificationDeniedAt');
    if (deniedAt) {
      const daysSinceDenied = (Date.now() - parseInt(deniedAt)) / (1000 * 60 * 60 * 24);
      // Don't ask again for 3 days if previously denied
      if (daysSinceDenied < 3) {
        console.log(`⏳ Waiting ${Math.ceil(3 - daysSinceDenied)} more days before asking again`);
        return;
      }
    }

    // Check if we asked recently (don't spam)
    const lastPromptAt = localStorage.getItem('notificationPromptAt');
    if (lastPromptAt) {
      const hoursSincePrompt = (Date.now() - parseInt(lastPromptAt)) / (1000 * 60 * 60);
      if (hoursSincePrompt < 24) {
        console.log(`⏳ Waiting ${Math.ceil(24 - hoursSincePrompt)} more hours before prompting again`);
        return;
      }
    }

    // Show the modal after a short delay for better UX
    const timer = setTimeout(() => {
      setShow(true);
      localStorage.setItem('notificationPromptAt', Date.now().toString());
    }, 3000);

    return () => clearTimeout(timer);
  };

  const handleAllow = async () => {
    setLoading(true);

    try {
      await subscribeToPushNotifications();
      console.log('✅ Push subscription successful');
      setShow(false);

      // Show success toast
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.success('🔔 Bildirimler aktif edildi!');
      }
    } catch (error) {
      console.error('❌ Push subscription failed:', error);

      // Check if user denied
      const permission = getNotificationPermission();
      if (permission === 'denied') {
        localStorage.setItem('notificationDeniedAt', Date.now().toString());
        setShow(false);

        if (typeof window !== 'undefined' && window.toast) {
          window.toast.error(
            isIOS
              ? '📱 iOS Ayarlar > Safari > Bildirimler\'den izin verin'
              : '⚠️ Bildirimlere izin vermek için tarayıcı ayarlarınızı kontrol edin'
          );
        }
      } else {
        if (typeof window !== 'undefined' && window.toast) {
          window.toast.error('❌ Bildirim aboneliği başarısız oldu');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = () => {
    localStorage.setItem('notificationDeniedAt', Date.now().toString());
    setShow(false);
    console.log('❌ User declined notification permission');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
        {/* Close button */}
        <button
          onClick={handleDeny}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
            <Bell className="text-green-600 dark:text-green-400" size={48} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          📬 Yeni Ürünleri Kaçırma!
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 dark:text-gray-300">
          {isIOS ? (
            <>
              🍏 iPhone'unuzda bildirimleri etkinleştirerek:
              <br />
              ✨ Yeni ürün ve kampanyalardan haberdar olun
              <br />
              🎁 Özel indirimlerden ilk siz yararlanın
            </>
          ) : (
            <>
              Bildirimleri açarak yeni ürünler, özel indirimler ve kampanyalardan anında haberdar olun! 🎉
            </>
          )}
        </p>

        {/* iOS specific instructions */}
        {isIOS && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-300">
            <strong>📱 iOS Kullanıcıları:</strong>
            <br />
            Safari bildirimleri destekliyor (iOS 16.4+). İzin verdikten sonra ayarlarınızdan kontrol edebilirsiniz.
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDeny}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
          >
            Şimdi Değil
          </button>
          <button
            onClick={handleAllow}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Yükleniyor...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                İzin Ver
              </>
            )}
          </button>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          🔒 Gizliliğiniz bizim için önemli. İstediğiniz zaman bildirimleri kapatabilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default NotificationPermissionModal;
