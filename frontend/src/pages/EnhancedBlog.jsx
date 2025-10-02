import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, MessageCircle, Eye, Heart, Share, ArrowLeft, ArrowRight } from 'lucide-react';

const EnhancedBlog = () => {
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
      <div className="min-h-screen relative z-0">
        <div className="relative z-0 min-h-screen backdrop-blur-sm py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-float">📝</div>
              <p className="text-xl font-sans text-white">Blog yazıları yükleniyor...</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-none overflow-hidden animate-pulse border-b-4 border-gray-300">
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
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
    <div className="min-h-screen relative z-0">
      <div className="relative z-0 min-h-screen backdrop-blur-sm py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-4">
          {/* Başlık */}
          <div className="text-center mb-6 sm:mb-8 px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white drop-shadow-2xl mb-3 sm:mb-4 animate-float">
              Rick'in Blog Dünyası
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-sans text-gray-100 drop-shadow-lg max-w-2xl mx-auto">
              Doğanın mucizelerini keşfedin, sağlıklı yaşamın sırlarını öğrenin
            </p>
          </div>

          {/* Search */}
          <div className="mb-6 sm:mb-8 px-4">
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Blog yazılarında ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-rick-green rounded-none focus:ring-2 focus:ring-rick-purple focus:border-rick-purple transition-all duration-300 font-sans text-sm sm:text-base bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-rick-green" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-rick-green text-white px-4 py-2 rounded-none hover:bg-green-600 hover:scale-105 transition-all duration-300 font-heading font-semibold text-sm sm:text-base"
                >
                  Ara
                </button>
              </div>
            </form>
          </div>

          {/* Featured Categories */}
          <div className="mb-6 sm:mb-8 px-4">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
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
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-rick-green rounded-none hover:bg-rick-green hover:text-white hover:scale-105 hover:animate-slime-wiggle transition-all duration-300 font-heading font-semibold text-xs sm:text-sm"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="px-4">
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-none border-b-4 border-rick-green overflow-hidden hover:scale-105 hover:border-rick-purple hover:animate-slime-drip transition-all duration-300 group"
                    >
                      {/* Image */}
                      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                        {post.image_url ? (
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl lg:text-6xl text-rick-green animate-float">
                            🌿
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="bg-rick-purple/80 text-white px-2 py-1 rounded-none text-xs font-heading font-semibold flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.views}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 font-sans">
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{post.author_name}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(post.published_at)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.comment_count}</span>
                          </span>
                        </div>

                        <h2 className="text-sm sm:text-base lg:text-xl font-heading font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-rick-green transition-colors leading-tight line-clamp-2">
                          <Link to={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h2>

                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 font-sans leading-relaxed line-clamp-2 sm:line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                          <Link
                            to={`/blog/${post.slug}`}
                            className="bg-rick-purple hover:bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-none font-heading font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105 hover:animate-slime-wiggle text-center"
                          >
                            Devamını Oku
                          </Link>

                          <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <button className="text-gray-400 hover:text-rick-pink hover:scale-110 transition-all duration-300">
                              <Heart className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-rick-green hover:scale-110 transition-all duration-300">
                              <Share className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 sm:px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-600 rounded-none disabled:opacity-50 hover:bg-rick-green hover:text-white hover:scale-105 transition-all duration-300 font-heading font-semibold text-sm flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Önceki</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 sm:px-4 py-2 border-2 rounded-none transition-all duration-300 font-heading font-semibold text-sm hover:scale-105 ${
                          currentPage === page
                            ? 'bg-rick-green text-white border-rick-green'
                            : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-rick-green hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 sm:px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-600 rounded-none disabled:opacity-50 hover:bg-rick-green hover:text-white hover:scale-105 transition-all duration-300 font-heading font-semibold text-sm flex items-center space-x-1"
                    >
                      <span className="hidden sm:inline">Sonraki</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* No Posts */
              <div className="text-center py-8 sm:py-12">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-none border-b-4 border-rick-green max-w-md mx-auto">
                  <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6 text-rick-green animate-bounce-slow">📝</div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {searchTerm ? 'Arama Sonucu Bulunamadı' : 'Henüz Blog Yazısı Yok'}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-sans mb-4 sm:mb-6">
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
                      className="bg-rick-green text-white px-6 sm:px-8 py-3 sm:py-4 rounded-none hover:scale-105 hover:animate-slime-drip transition-all duration-300 font-heading font-semibold text-base sm:text-lg"
                    >
                      Tüm Yazıları Görüntüle
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Newsletter Signup */}
          <div className="mt-8 sm:mt-12 lg:mt-16 px-4">
            <div className="bg-rick-purple/90 backdrop-blur-sm rounded-none border-b-4 border-rick-pink p-6 sm:p-8 text-center">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-white mb-3 sm:mb-4 flex items-center justify-center space-x-2">
                <span>📧</span>
                <span>Blog Güncellemelerini Kaçırmayın</span>
              </h3>
              <p className="text-sm sm:text-base text-purple-100 mb-4 sm:mb-6 font-sans">
                Yeni blog yazılarımızdan ve özel içeriklerimizden haberdar olmak için e-bültenimize katılın
              </p>
              <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 sm:gap-0">
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="flex-1 px-4 py-3 rounded-none sm:rounded-none border-2 border-rick-pink focus:outline-none focus:border-white transition-colors font-sans text-sm sm:text-base"
                />
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-3 bg-rick-pink text-white rounded-none hover:bg-pink-600 hover:scale-105 transition-all duration-300 font-heading font-semibold text-sm sm:text-base"
                >
                  Abone Ol
                </button>
              </form>
              <p className="text-purple-200 text-xs sm:text-sm mt-2 sm:mt-3 font-sans flex items-center justify-center space-x-1">
                <span>🔒</span>
                <span>E-posta adresiniz güvende, spam göndermiyoruz</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBlog;