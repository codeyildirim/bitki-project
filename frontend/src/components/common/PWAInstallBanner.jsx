import React from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const PWAInstallBanner = () => {
  const { showInstallButton, installPWA, isInstallable } = usePWAInstall();

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-lg shadow-lg z-50 mx-auto max-w-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📱</span>
            <div>
              <h3 className="font-semibold text-sm">Uygulamayı Yükle</h3>
              <p className="text-xs opacity-90">
                {isInstallable ?
                  'Hızlı erişim için ana ekrana ekle' :
                  'Ana ekrana eklemek için paylaş butonunu kullan'
                }
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={installPWA}
          className="bg-white text-green-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          {isInstallable ? 'Yükle' : 'Nasıl?'}
        </button>
      </div>
    </div>
  );
};

export default PWAInstallBanner;