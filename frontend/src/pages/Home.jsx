import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import {
  ArrowRight,
  Shield,
  Truck,
  Heart,
  Star,
  Leaf,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { productsApi } from '../utils/api';
import { formatPrice, getImageUrl } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const { data: featuredProducts, isLoading } = useQuery(
    'featured-products',
    productsApi.getFeatured
  );

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3"
              >
                <Leaf className="w-5 h-5 text-green-300" />
                <span className="text-sm font-medium">100% Doğal Ürünler</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Şifalı Bitkilerin
                <br />
                <span className="text-green-300">Gücünü Keşfedin</span>
              </h1>

              <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
                Geleneksel bilgi ile modern kalite anlayışını buluşturan
                doğal ürünlerle sağlıklı yaşamın kapılarını aralayın
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link
                to="/products"
                className="btn bg-white text-green-700 hover:bg-green-50 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 group"
              >
                <span>Ürünleri Keşfet</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/blog"
                className="btn btn-outline border-white text-white hover:bg-white hover:text-green-700 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
              >
                Blog Yazıları
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-300/20"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 30}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Leaf className="w-8 h-8 md:w-12 md:h-12" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Neden <span className="text-primary-600">Şifalı Bitkiler</span>?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Kalite, güven ve doğallığın buluştuğu noktada, size en iyi hizmeti sunuyoruz
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: Shield,
                title: 'Güvenilir Kalite',
                description: 'Tüm ürünlerimiz kalite kontrol süreçlerinden geçer',
                color: 'text-blue-600'
              },
              {
                icon: Leaf,
                title: '%100 Doğal',
                description: 'Kimyasal katkı maddesi içermeyen doğal ürünler',
                color: 'text-green-600'
              },
              {
                icon: Truck,
                title: 'Hızlı Kargo',
                description: 'Türkiye geneline hızlı ve güvenli teslimat',
                color: 'text-purple-600'
              },
              {
                icon: Heart,
                title: 'Uzman Desteği',
                description: 'Alanında uzman ekibimizden sürekli destek',
                color: 'text-red-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="text-center group hover-lift"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300 mb-4 ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Öne Çıkan <span className="text-primary-600">Ürünler</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              En çok tercih edilen doğal ürünlerimizi keşfedin
            </motion.p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" text="Ürünler yükleniyor..." />
            </div>
          ) : (
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {featuredProducts?.data?.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  className="card hover-lift group"
                >
                  <Link to={`/products/${product.id}`}>
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                      {product.rating > 0 && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-medium">{product.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Stok: {product.stock}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              to="/products"
              className="btn btn-primary px-8 py-3 text-lg font-semibold rounded-full hover:shadow-lg transition-all duration-300 inline-flex items-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Tüm Ürünleri Görüntüle</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 earth-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8 text-white"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Özel Fırsatlar</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold">
                Doğal Yaşamın Kapılarını Aralayın
              </h2>

              <p className="text-xl text-yellow-100 max-w-3xl mx-auto">
                İlk siparişinizde %15 indirim kazanın ve doğal ürünlerle
                sağlıklı yaşama adım atın
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/auth/register"
                className="btn bg-white text-yellow-700 hover:bg-yellow-50 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Hemen Kayıt Ol
              </Link>
              <Link
                to="/products"
                className="btn btn-outline border-white text-white hover:bg-white hover:text-yellow-700 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
              >
                Alışverişe Başla
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;