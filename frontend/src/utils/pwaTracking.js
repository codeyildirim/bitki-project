import { API_CONFIG } from '../config/api.js';
import { initializePushNotifications } from './pushNotifications.js';

// Get device information for PWA tracking
const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    mobile: /Mobi|Android/i.test(navigator.userAgent),
    tablet: /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
};

// Track PWA events to the backend
export const trackPWAEvent = async (eventType, additionalData = {}) => {
  try {
    const deviceInfo = {
      ...getDeviceInfo(),
      ...additionalData
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/pwa/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventType,
        deviceInfo
      })
    });

    if (response.ok) {
      console.log(`📊 PWA event tracked: ${eventType}`);
    } else {
      console.warn(`❌ Failed to track PWA event: ${eventType}`);
    }
  } catch (error) {
    console.error('PWA tracking error:', error);
  }
};

// Track PWA install
export const trackPWAInstall = () => {
  trackPWAEvent('install', {
    installMethod: 'prompt',
    timestamp: new Date().toISOString()
  });
};

// Track PWA uninstall
export const trackPWAUninstall = () => {
  trackPWAEvent('uninstall', {
    timestamp: new Date().toISOString()
  });
};

// Track PWA launch
export const trackPWALaunch = () => {
  trackPWAEvent('launch', {
    launchMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
    timestamp: new Date().toISOString()
  });
};

// Track PWA update
export const trackPWAUpdate = () => {
  trackPWAEvent('update', {
    timestamp: new Date().toISOString()
  });
};

// Initialize PWA tracking
export const initializePWATracking = () => {
  // Track launch event when app starts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPWALaunch);
  } else {
    trackPWALaunch();
  }

  // Track install event
  window.addEventListener('appinstalled', (e) => {
    console.log('📱 PWA installed event detected');
    trackPWAInstall();
  });

  // Track beforeinstallprompt for analytics
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 PWA install prompt shown');
    // Don't track here, track when user actually installs
  });

  // Track service worker updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker updated');
      trackPWAUpdate();
    });
  }

  // Track visibility change (when user returns to PWA)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.matchMedia('(display-mode: standalone)').matches) {
      console.log('📱 PWA came back to foreground');
      trackPWALaunch();
    }
  });

  // Initialize push notifications
  initializePushNotifications();

  console.log('📊 PWA tracking initialized');
};