import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const PWAInstallBanner = () => {
  const { showInstallButton, installPWA, isInstallable } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (!showInstallButton) {
    return null;
  }

  const IOSInstallGuide = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-auto relative">
        <button
          onClick={() => setShowGuide(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ana Ekrana Ekle
          </h3>
          <p className="text-sm text-gray-600">
            Uygulamayı kolayca erişebilmek için ana ekranına ekle
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <p className="text-sm text-gray-800 font-medium">Safari'nin alt kısmındaki paylaş butonuna bas</p>
              <div className="mt-2 flex items-center justify-center bg-gray-50 rounded-lg p-3">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </div>
                <span className="ml-2 text-xs text-gray-600">Paylaş</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <p className="text-sm text-gray-800 font-medium">"Ana Ekrana Ekle" seçeneğini bul</p>
              <div className="mt-2 flex items-center justify-center bg-gray-50 rounded-lg p-3">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-white text-lg">+</span>
                </div>
                <span className="ml-2 text-xs text-gray-600">Ana Ekrana Ekle</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <p className="text-sm text-gray-800 font-medium">Sağ üstteki "Ekle" butonuna bas</p>
              <div className="mt-2 text-center bg-blue-500 text-white rounded-lg py-2 px-4 text-sm font-medium">
                Ekle
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <span>✨</span>
            <span>Artık ana ekranından hızlıca erişebilirsin!</span>
            <span>✨</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
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
                    'Ana ekrana eklemek için adımları takip et'
                  }
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (isInstallable) {
                installPWA();
              } else {
                setShowGuide(true);
              }
            }}
            className="bg-white text-green-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            {isInstallable ? 'Yükle' : 'Nasıl?'}
          </button>
        </div>
      </div>

      {showGuide && <IOSInstallGuide />}
    </>
  );
};

export default PWAInstallBanner;