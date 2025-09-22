import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Leaf className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-bold">Şifalı Bitkiler</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Doğal ve kaliteli şifalı bitkiler ile sağlıklı yaşamın kapılarını araladığımız
              platformda, geleneksel bilgi ile modern kalite anlayışını buluşturuyoruz.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Ürünler
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Müşteri Hizmetleri</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/shipping-info"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Kargo Bilgileri
                </Link>
              </li>
              <li>
                <Link
                  to="/return-policy"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  İade Koşulları
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Sık Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Örnek Mahallesi, Şifalı Sokak No:123<br />
                  İstanbul, Türkiye
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  +90 (212) 123 45 67
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  info@sifalibitkiler.com
                </span>
              </div>
            </div>

            {/* Ödeme Yöntemleri */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Ödeme Yöntemleri</h4>
              <div className="flex space-x-2">
                <div className="bg-white rounded p-1">
                  <span className="text-xs text-gray-800 font-bold">IBAN</span>
                </div>
                <div className="bg-orange-500 rounded p-1">
                  <span className="text-xs text-white font-bold">BTC</span>
                </div>
                <div className="bg-blue-600 rounded p-1">
                  <span className="text-xs text-white font-bold">ETH</span>
                </div>
                <div className="bg-yellow-500 rounded p-1">
                  <span className="text-xs text-white font-bold">BNB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Çizgi ve Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Şifalı Bitkiler E-Ticaret. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>🌿 Doğal</span>
              <span>✅ Güvenilir</span>
              <span>🚚 Hızlı Kargo</span>
              <span>🔒 Güvenli Ödeme</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;