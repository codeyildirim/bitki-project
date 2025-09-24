import { API_CONFIG } from '../config/api.js';

// VAPID public key - should match backend
const VAPID_PUBLIC_KEY = 'BIb3RmkvdoXbCi9vRJZJqMq6Tn0HoLGwVWXBt8hNbN1mKs8Dd3DLnxlkdDTpU1EqTbgOHCfS_DfTZl6KEHpcvHo';

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Get device info for push subscription
const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    mobile: /Mobi|Android/i.test(navigator.userAgent),
    tablet: /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent),
    timestamp: new Date().toISOString()
  };
};

// Check if push notifications are supported
export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Check current notification permission
export const getNotificationPermission = () => {
  if (!isPushSupported()) return 'not-supported';
  return Notification.permission;
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!isPushSupported()) {
    console.log('❌ Push notifications not supported');
    return 'not-supported';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log(`🔔 Notification permission: ${permission}`);
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }

  try {
    // Request permission first
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Register service worker if not already registered
    const registration = await navigator.serviceWorker.ready;
    console.log('🔄 Service worker ready for push subscription');

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    console.log('📨 Push subscription created:', subscription);

    // Send subscription to backend
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/pwa/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        deviceInfo: getDeviceInfo()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to register push subscription on server');
    }

    const result = await response.json();
    console.log('✅ Push subscription registered:', result);

    return subscription;
  } catch (error) {
    console.error('❌ Push subscription failed:', error);
    throw error;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('🤷‍♂️ No active push subscription found');
      return;
    }

    // Unsubscribe from push notifications
    await subscription.unsubscribe();
    console.log('📤 Push subscription cancelled locally');

    // Notify backend
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/pwa/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint
      })
    });

    if (!response.ok) {
      console.warn('⚠️ Failed to unsubscribe on server, but local unsubscription succeeded');
    }

    console.log('✅ Push subscription cancelled');
  } catch (error) {
    console.error('❌ Push unsubscription failed:', error);
    throw error;
  }
};

// Check if currently subscribed to push notifications
export const isPushSubscribed = async () => {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('Error checking push subscription:', error);
    return false;
  }
};

// Get current push subscription
export const getCurrentPushSubscription = async () => {
  if (!isPushSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
};

// Initialize push notifications (called automatically when PWA tracking is initialized)
export const initializePushNotifications = async () => {
  if (!isPushSupported()) {
    console.log('❌ Push notifications not supported on this device');
    return;
  }

  // Check if already subscribed
  const isSubscribed = await isPushSubscribed();
  console.log(`🔔 Push notifications status: ${isSubscribed ? 'subscribed' : 'not subscribed'}`);

  // Listen for incoming push messages
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 Push message received:', event.data);

      // Handle push notification click events
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        // Navigate to specified URL if provided
        if (event.data.url && event.data.url !== '/') {
          window.location.href = event.data.url;
        }
      }
    });
  }

  console.log('🔔 Push notifications initialized');
};