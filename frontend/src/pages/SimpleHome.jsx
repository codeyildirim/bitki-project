import React from 'react';
import { Link } from 'react-router-dom';

const SimpleHome = () => {
  return (
    <div className="min-h-screen relative z-0">
      {/* Content */}
      <div className="relative z-0 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white drop-shadow-2xl mb-4 sm:mb-6 animate-float px-4">
            Rick'in Dünyasına Merhaba
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-sans text-gray-100 drop-shadow-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Doğanın gücüyle sağlığınıza kavuşun. Kaliteli ve organik şifalı bitkileri keşfedin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link
              to="/products"
              className="w-full sm:w-auto bg-rick-green text-white px-6 sm:px-8 py-3 sm:py-4 rounded-none hover:scale-105 hover:animate-slime-drip transition-all duration-300 inline-block font-heading font-semibold text-base sm:text-lg border-b-4 border-rick-green hover:border-green-600 text-center"
            >
              Ürünleri Keşfet
            </Link>
            <Link
              to="/blog"
              className="w-full sm:w-auto bg-rick-purple text-white px-6 sm:px-8 py-3 sm:py-4 rounded-none hover:scale-105 hover:animate-slime-drip transition-all duration-300 inline-block font-heading font-semibold text-base sm:text-lg border-b-4 border-rick-purple hover:border-purple-600 text-center"
            >
              Blog Sayfasını İncele
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 px-4">
          <div className="text-center p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-none shadow-md hover:scale-105 transition-transform duration-300 border-b-4 border-rick-green hover:animate-slime-wiggle">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🌱</div>
            <h3 className="text-lg sm:text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">Doğal Ürünler</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-sans">100% organik ve doğal şifalı bitkiler</p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-none shadow-md hover:scale-105 transition-transform duration-300 border-b-4 border-rick-purple hover:animate-slime-wiggle">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🚚</div>
            <h3 className="text-lg sm:text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">Hızlı Kargo</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-sans">Türkiye geneli ücretsiz kargo</p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-none shadow-md hover:scale-105 transition-transform duration-300 border-b-4 border-rick-pink hover:animate-slime-wiggle sm:col-span-2 lg:col-span-1">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⭐</div>
            <h3 className="text-lg sm:text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">Kaliteli Hizmet</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-sans">Müşteri memnuniyeti garantisi</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-rick-green text-white p-6 sm:p-8 lg:p-12 rounded-none border-b-4 border-green-600 hover:animate-slime-drip mx-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold mb-3 sm:mb-4">Sağlıklı Yaşama Başlayın</h2>
          <p className="text-base sm:text-lg lg:text-xl font-sans mb-4 sm:mb-6">Doğal çözümlerle sağlığınızı koruyun</p>
          <Link
            to="/auth/register"
            className="w-full sm:w-auto bg-white text-rick-green px-6 sm:px-8 py-3 sm:py-4 rounded-none hover:scale-105 hover:animate-slime-wiggle transition-all duration-300 inline-block font-heading font-semibold text-base sm:text-lg border-b-4 border-white hover:border-gray-200"
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