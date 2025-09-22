import React from 'react';
import { Link } from 'react-router-dom';

const SimpleHome = () => {
  return (
    <div className="min-h-screen relative z-0">
      {/* Content */}
      <div className="relative z-0 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-6">
            🌿 Şifalı Bitkiler E-Ticaret
          </h1>
          <p className="text-xl text-gray-100 drop-shadow-lg mb-8 max-w-2xl mx-auto">
            Doğanın gücüyle sağlığınıza kavuşun. Kaliteli ve organik şifalı bitkileri keşfedin.
          </p>
          <div className="space-x-4">
            <Link
              to="/products"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
            >
              Ürünleri İncele
            </Link>
            <Link
              to="/blog"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-block"
            >
              Blog
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg shadow-md">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Doğal Ürünler</h3>
            <p className="text-gray-600 dark:text-gray-300">100% organik ve doğal şifalı bitkiler</p>
          </div>
          <div className="text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg shadow-md">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Hızlı Kargo</h3>
            <p className="text-gray-600 dark:text-gray-300">Türkiye geneli ücretsiz kargo</p>
          </div>
          <div className="text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg shadow-md">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Kaliteli Hizmet</h3>
            <p className="text-gray-600 dark:text-gray-300">Müşteri memnuniyeti garantisi</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-green-600 dark:bg-green-700 text-white p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Sağlıklı Yaşama Başlayın</h2>
          <p className="text-xl mb-6">Doğal çözümlerle sağlığınızı koruyun</p>
          <Link
            to="/auth/register"
            className="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700 transition-colors inline-block font-semibold"
          >
            Hemen Kayıt Olun
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SimpleHome;