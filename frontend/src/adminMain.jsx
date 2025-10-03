import React from 'react'
import ReactDOM from 'react-dom/client'
import AdminApp from './AdminApp.jsx'
import './index.css'

// SW temizliği: admin domain eski public SW'yi kullanmasın
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    if (window.caches && typeof window.caches.keys === 'function') {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  } catch (_) {
    // Hata olsa bile devam et
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
)
