import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Heart, ShoppingCart, ArrowRight } from 'lucide-react';
import BackgroundVideo from '../BackgroundVideo';

const ModernHome = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kategorileri getir
        try {
          const categoriesRes = await fetch('/api/products/categories');
          if (categoriesRes.ok) {
            const categoriesData = await categoriesRes.json();
            setCategories(categoriesData.data || []);
          }
        } catch (err) {
          console.error('Kategoriler yüklenemedi:', err);
        }

        // Öne çıkan ürünleri getir
        try {
          const featuredRes = await fetch('/api/products/featured');
          if (featuredRes.ok) {
            const featuredData = await featuredRes.json();
            setFeaturedProducts(featuredData.data || []);
          }
        } catch (err) {
          console.error('Öne çıkan ürünler yüklenemedi:', err);
        }

        // Son blog yazılarını getir
        try {
          const blogsRes = await fetch('/api/blog?limit=3');
          if (blogsRes.ok) {
            const blogsData = await blogsRes.json();
            setRecentBlogs(blogsData.data || []);
          }
        } catch (err) {
          console.error('Blog yazıları yüklenemedi:', err);
        }
      } catch (error) {
        console.error('Genel veri getirme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <BackgroundVideo />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            🌿 Doğanın Gücü
            <span className="block text-3xl md:text-5xl lg:text-6xl text-green-400 mt-2">
              Şifalı Bitkiler
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto drop-shadow-lg">
            Doğal yaşamın kapıları sizinle açılıyor. Kaliteli ve organik şifalı bitkilerle sağlığınıza kavuşun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/products"
              className="group px-8 py-4 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center space-x-2"
            >
              <span>Ürünleri Keşfet</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/blog"
              className="group px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30 flex items-center space-x-2"
            >
              <span>Blog'u İncele</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kategorilerimiz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Doğal ürün kategorilerimizi keşfedin ve ihtiyacınıza uygun ürünleri bulun
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      {category.name}
                    </h3>
                    <ChevronRight className="w-6 h-6 text-green-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    {category.description || 'Doğal ve organik ürünler'}
                  </p>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <span>Ürünleri Gör</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Öne Çıkan Ürünler
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              En popüler ve kaliteli ürünlerimizi keşfedin
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={product.images?.[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-green-600">
                        ₺{product.price}
                      </span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {product.rating || 4.5}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/products/${product.id}`}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 group"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>İncele</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors space-x-2"
            >
              <span>Tüm Ürünleri Gör</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Blog Yazılarımız
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Doğal yaşam ve şifalı bitkiler hakkında bilgi edinin
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {blog.content?.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(blog.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      <Link
                        to={`/blog/${blog.id}`}
                        className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
                      >
                        <span>Devamını Oku</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-900 transition-colors space-x-2"
            >
              <span>Tüm Yazıları Gör</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                %100 Doğal
              </h3>
              <p className="text-gray-600">
                Tüm ürünlerimiz organik ve doğal kaynaklardan elde edilmiştir
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Hızlı Kargo
              </h3>
              <p className="text-gray-600">
                Türkiye geneli ücretsiz ve hızlı kargo imkanı
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Kalite Garantisi
              </h3>
              <p className="text-gray-600">
                Müşteri memnuniyeti ve kalite garantisi ile hizmet veriyoruz
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernHome;