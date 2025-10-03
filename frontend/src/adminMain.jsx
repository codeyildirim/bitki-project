import React from 'react'
import ReactDOM from 'react-dom/client'
import AdminApp from './AdminApp.jsx'
import './index.css'

// AGRESIF SW ve Cache Temizliği: Admin domain asla public SW kullanmasın
if (typeof window !== 'undefined') {
  // 1. Service Worker'ları temizle
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
        console.log('Admin: Service Worker unregistered');
      });
    });

    // Controller varsa zorla deactivate et
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // 2. Tüm cache'leri temizle
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
        console.log('Admin: Cache deleted:', cacheName);
      });
    });
  }

  // 3. localStorage'dan public site verilerini temizle (admin auth hariç)
  try {
    // Public site'a ait key'leri temizle
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Admin auth token'ı koru, diğerlerini temizle
      if (key && !key.includes('admin')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (_) {}

  // 4. Sayfa yüklenince SW kontrolü yap
  window.addEventListener('load', () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.warn('Admin: Service Worker hala aktif! Sayfa yeniden yüklenecek...');
      // SW varsa sayfayı hard reload yap
      window.location.reload(true);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
)
