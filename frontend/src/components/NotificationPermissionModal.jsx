import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  isPushSupported,
  getNotificationPermission
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
      // iOS Safari permission timeout protection
      const requestPermissionWithTimeout = async () => {
        const timeout = new Promise(resolve => setTimeout(() => resolve('timeout'), 3000));
        const permissionPromise = Notification.requestPermission();
        const result = await Promise.race([permissionPromise, timeout]);

        if (result === 'timeout') {
          console.warn('⚠️ iOS Safari permission promise did not resolve');
          setLoading(false);
          setShow(false);
          toast.error('⏱️ İzin isteği zaman aşımına uğradı. Lütfen tekrar deneyin.');
          return null;
        }

        return result;
      };

      const permission = await requestPermissionWithTimeout();

      if (permission === null) {
        // Timeout occurred
        return;
      }

      if (permission === 'granted') {
        // Permission granted - proceed with subscription
        console.log('✅ Notification permission granted');

        // Register push subscription
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array('BIb3RmkvdoXbCi9vRJZJqMq6Tn0HoLGwVWXBt8hNbN1mKs8Dd3DLnxlkdDTpU1EqTbgOHCfS_DfTZl6KEHpcvHo')
        });

        // Send subscription to backend
        await fetch('https://bitki-project.onrender.com/api/pwa/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            deviceInfo: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              language: navigator.language
            }
          })
        });

        setShow(false);
        toast.success('🎉 Bildirimlere başarıyla izin verildi!');
        console.log('✅ Push subscription successful');

      } else if (permission === 'denied') {
        // Permission denied
        console.warn('❌ Notification permission denied');
        localStorage.setItem('notificationDeniedAt', Date.now().toString());

        toast.error(
          isIOS
            ? '📱 iOS Ayarlar > Safari > Bildirimler\'den izin verin'
            : '⚠️ Bildirim izni reddedildi'
        );

        // Auto-close modal after 2 seconds
        setTimeout(() => {
          setShow(false);
        }, 2000);
      } else {
        // Permission dismissed (default)
        console.log('ℹ️ Notification permission dismissed');
        setShow(false);
      }

    } catch (error) {
      console.error('❌ Push subscription failed:', error);
      toast.error('❌ Bildirim aboneliği başarısız oldu');
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  // Helper function for VAPID key conversion
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
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
