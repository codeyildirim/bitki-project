import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DarkAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Admin kontrolu
  if (!user || user.is_admin !== 1) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-red-400 mb-4">[ACCESS DENIED] Yetkisiz Erisim</h2>
          <p className="text-gray-300 mb-6">Bu panele erisim yetkiniz bulunmamaktadir.</p>
          <Link
            to="/"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors inline-block"
          >
            Ana Sayfaya Don
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Darkweb Admin Header */}
      <header className="bg-black border-b border-red-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-red-400 font-mono">
                SHADOW ADMIN
              </Link>
              <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded border border-red-700">GIZLI</span>
              <span className="text-xs bg-gray-800 text-green-400 px-2 py-1 rounded border border-green-700">SIFRELENMIS</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 font-mono">
                <span className="text-red-400 animate-pulse">●</span> {user.nickname}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-900 hover:bg-red-800 px-4 py-2 rounded transition-colors text-sm border border-red-700 text-red-200"
              >
                CIKIS YAP
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Darkweb Sidebar */}
        <aside className="w-64 bg-black border-r border-red-900 min-h-screen">
          <nav className="mt-6">
            <div className="px-4 space-y-1">
              <Link
                to="/"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-red-400">◉</span>
                <span>Ana Panel</span>
              </Link>
              <Link
                to="//products"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-green-400">◈</span>
                <span>Urun Kontrolu</span>
              </Link>
              <Link
                to="//orders"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-purple-400">◇</span>
                <span>Siparis Takibi</span>
              </Link>
              <Link
                to="//categories"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-green-400">◆</span>
                <span>Kategoriler</span>
              </Link>
              <Link
                to="//users"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-purple-400">◎</span>
                <span>Kullanici Loglari</span>
              </Link>
              <Link
                to="//security"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-red-400">◈</span>
                <span>Guvenlik Kontrolu</span>
              </Link>
              <Link
                to="//blog"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-green-400">◇</span>
                <span>Icerik Yoneticisi</span>
              </Link>
              <Link
                to="//coupons"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-yellow-400">◆</span>
                <span>Kupon & Kampanya</span>
              </Link>
              <Link
                to="//pwa"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-blue-400">◈</span>
                <span>PWA Yonetimi</span>
              </Link>
              <Link
                to="//support"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-cyan-400">◇</span>
                <span>Destek & FAQ</span>
              </Link>
              <Link
                to="//backgrounds"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-purple-400">◈</span>
                <span>Arka Plan & Medya</span>
              </Link>
              <Link
                to="//settings"
                className="flex items-center space-x-3 text-gray-300 p-3 rounded-lg hover:bg-red-900 hover:text-red-200 transition-colors font-mono"
              >
                <span className="text-purple-400">◎</span>
                <span>Sistem Ayarlari</span>
              </Link>
            </div>

            {/* Operations Section */}
            <div className="px-4 mt-6">
              <div className="border-t border-red-900 pt-6">
                <div className="text-xs text-red-400 uppercase tracking-wide mb-3 font-mono">
                  HIZLI ISLEMLER
                </div>
                <div className="space-y-1">
                  <button className="w-full text-left text-gray-400 p-2 rounded hover:bg-red-900 hover:text-red-200 transition-colors text-sm font-mono">
                    ◦ Onbellek Temizle
                  </button>
                  <button className="w-full text-left text-gray-400 p-2 rounded hover:bg-red-900 hover:text-red-200 transition-colors text-sm font-mono">
                    ◦ Yedek Al
                  </button>
                  <button
                    className="w-full text-left text-gray-400 p-2 rounded hover:bg-red-900 hover:text-red-200 transition-colors text-sm font-mono"
                    onClick={() => {
                      // Log görüntüleme fonksiyonu
                      const logs = [
                        `[${new Date().toISOString()}] ADMIN GIRIS: ${user.nickname}`,
                        `[${new Date().toISOString()}] SISTEM DURUMU: ONLINE`,
                        `[${new Date().toISOString()}] VERITABANI: BAGLI`,
                        `[${new Date().toISOString()}] ONBELLEK: AKTIF`
                      ];
                      alert('SISTEM LOGLARI:\n\n' + logs.join('\n'));
                    }}
                  >
                    ◦ Log Goruntule
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content - Darkweb Theme */}
        <main className="flex-1 p-8 bg-gray-900">
          <Outlet />
        </main>
      </div>

      {/* Darkweb Footer */}
      <footer className="bg-black border-t border-red-900 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm font-mono">
          <span className="text-red-400">GIZLI</span>
          <span> Shadow Admin v2.0 | </span>
          <span>Son Erisim: {new Date().toLocaleString('tr-TR')} | </span>
          <span className="text-green-400">Baglanti: Sifrelenmis</span>
        </div>
      </footer>
    </div>
  );
};

export default DarkAdminLayout;