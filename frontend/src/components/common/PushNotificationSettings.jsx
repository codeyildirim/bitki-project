import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushSubscribed
} from '../../utils/pushNotifications.js';

const PushNotificationSettings = ({ className = '' }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkPushStatus = async () => {
      setIsSupported(isPushSupported());
      if (isPushSupported()) {
        setPermission(getNotificationPermission());
        setIsSubscribed(await isPushSubscribed());
      }
    };

    checkPushStatus();
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await subscribeToPushNotifications();
      setIsSubscribed(true);
      setPermission('granted');
      toast.success('🔔 Bildirimler aktif edildi!');
    } catch (error) {
      console.error('Push subscription failed:', error);
      toast.error('Bildirim aktifleştirilemedi: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
      toast.success('🔕 Bildirimler kapatıldı');
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
      toast.error('Bildirim kapatılamadı: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <BellOff size={20} />
          <span className="text-sm">Bu cihazda push bildirimleri desteklenmiyor</span>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 p-4 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <BellOff size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium">Bildirimler engellenmiş</p>
            <p className="text-xs text-red-500 dark:text-red-300">
              Tarayıcı ayarlarından bildirimlere izin vermeniz gerekiyor
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isSubscribed ? (
            <Bell className="text-green-600 dark:text-green-400" size={20} />
          ) : (
            <BellOff className="text-gray-400" size={20} />
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Push Bildirimleri
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isSubscribed
                ? 'Özel teklifler ve güncellemeler hakkında bilgilendirileceksiniz'
                : 'Özel teklifler ve güncellemeler için bildirim alın'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isSubscribed ? (
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Kapatılıyor...' : 'Kapat'}
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Aktifleştiriliyor...' : 'Aktifleştir'}
            </button>
          )}
        </div>
      </div>

      {isSubscribed && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Bildirimler aktif • Yeni teklif ve güncellemeler bildirilecek</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotificationSettings;