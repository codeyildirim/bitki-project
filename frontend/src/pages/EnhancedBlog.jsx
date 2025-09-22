import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import DynamicBackground from '../components/DynamicBackground';

const EnhancedBlog = () => {
  const { isDark } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchTerm]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 6
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/blog?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      } else {
        // Demo veriler
        setPosts([
          {
            id: 1,
            title: 'Adaçayının Faydaları ve Kullanım Alanları',
            slug: 'adacayinin-faydalari',
            excerpt: 'Adaçayı, antik çağlardan beri bilinen ve birçok hastalığın tedavisinde kullanılan değerli bir bitkidir.',
            image_url: '/images/blog/adacayi.jpg',
            author_name: 'Dr. Ayşe Botanik',
            published_at: '2024-01-15T10:00:00Z',
            views: 1250,
            comment_count: 8
          },
          {
            id: 2,
            title: 'Doğal Detoks İçin En Etkili Bitkiler',
            slug: 'dogal-detoks-bitkileri',
            excerpt: 'Vücudunuzu doğal yollarla arındırmak için kullanabileceğiniz en etkili bitkileri keşfedin.',
            image_url: '/images/blog/detoks.jpg',
            author_name: 'Uzm. Mehmet Herbalist',
            published_at: '2024-01-10T14:30:00Z',
            views: 987,
            comment_count: 12
          },
          {
            id: 3,
            title: 'Kış Çayları: Bağışıklık Güçlendiren Karışımlar',
            slug: 'kis-cayları-bagisiklik',
            excerpt: 'Soğuk kış aylarında bağışıklık sisteminizi güçlendiren özel bitkisel çay karışımları.',
            image_url: '/images/blog/kis-caylari.jpg',
            author_name: 'Fitoterapi Uzm. Fatma',
            published_at: '2024-01-05T09:15:00Z',
            views: 765,
            comment_count: 6
          }
        ]);
      }
    } catch (error) {
      console.error('Blog yazıları yükleme hatası:', error);
      // Demo veriler fallback
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Dynamic Background */}
      <DynamicBackground page="blog" />

      <div className="relative z-0 min-h-screen backdrop-blur-sm py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📝 Şifalı Bitkiler Blogu
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Doğanın mucizelerini keşfedin, sağlıklı yaşamın sırlarını öğrenin
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="flex">
              <input
                type="text"
                placeholder="Blog yazılarında ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition-colors"
              >
                🔍
              </button>
            </div>
          </form>
        </div>

        {/* Featured Categories */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              '🌿 Şifalı Bitkiler',
              '🍵 Bitki Çayları',
              '💊 Doğal Tedavi',
              '🧘 Wellness',
              '🌱 Organik Yaşam',
              '🔬 Araştırmalar'
            ].map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-green-50 dark:hover:bg-green-900 hover:border-green-500 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🌿
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {post.views} görüntülenme
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span>👤 {post.author_name}</span>
                      <span>📅 {formatDate(post.published_at)}</span>
                      <span>💬 {post.comment_count}</span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm group-hover:underline"
                      >
                        Devamını Oku →
                      </Link>

                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          ❤️
                        </button>
                        <button className="text-gray-400 hover:text-blue-500 transition-colors">
                          📤
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  ← Önceki
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Sonraki →
                </button>
              </div>
            )}
          </>
        ) : (
          /* No Posts */
          <div className="text-center py-12">
            <div className="text-6xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {searchTerm ? 'Arama Sonucu Bulunamadı' : 'Henüz Blog Yazısı Yok'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {searchTerm
                ? 'Farklı anahtar kelimeler deneyebilirsiniz'
                : 'Yakında değerli içeriklerimizi paylaşacağız'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Tüm Yazıları Görüntüle
              </button>
            )}
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            📧 Blog Güncellemelerini Kaçırmayın
          </h3>
          <p className="text-green-100 mb-6">
            Yeni blog yazılarımızdan ve özel içeriklerimizden haberdar olmak için e-bültenimize katılın
          </p>
          <form className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-4 py-3 rounded-l-lg focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-green-600 rounded-r-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Abone Ol
            </button>
          </form>
          <p className="text-green-200 text-sm mt-3">
            🔒 E-posta adresiniz güvende, spam göndermiyoruz
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EnhancedBlog;