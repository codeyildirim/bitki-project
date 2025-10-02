import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowRight } from 'lucide-react';

const RickBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      const data = await response.json();

      if (data.success) {
        setPosts(data.data || []);
      } else {
        // Demo veriler
        setPosts([
          {
            id: 1,
            title: 'Adaçayının Faydaları ve Kullanım Alanları',
            slug: 'adacayinin-faydalari',
            content: 'Adaçayı, antik çağlardan beri bilinen ve birçok hastalığın tedavisinde kullanılan değerli bir bitkidir. Antiseptik ve anti-inflamatuar özellikleri sayesinde...',
            background_image: '/images/blog/adacayi.jpg',
            views: 1250,
            published_at: '2024-01-15T10:00:00Z'
          },
          {
            id: 2,
            title: 'Ihlamur Çayının Sağlık Üzerindeki Etkileri',
            slug: 'ihlamur-cayinin-sağlik-etkileri',
            content: 'Ihlamur çayı, stresi azaltan ve rahatlatıcı etkisi olan doğal bir içecektir. Özellikle uyku problemleri yaşayanlar için idealdir...',
            background_image: '/images/blog/ihlamur.jpg',
            views: 890,
            published_at: '2024-01-12T14:30:00Z'
          },
          {
            id: 3,
            title: 'Yeşil Çayın Antioksidan Gücü',
            slug: 'yesil-cayin-antioksidan-gucu',
            content: 'Yeşil çay, yüksek antioksidan içeriği ile vücudu serbest radikallerden korur. Günlük 2-3 fincan yeşil çay tüketimi...',
            background_image: '/images/blog/yesil-cay.jpg',
            views: 1450,
            published_at: '2024-01-10T09:15:00Z'
          },
          {
            id: 4,
            title: 'Papatya Çayının Gevşetici Etkisi',
            slug: 'papatya-cayinin-gevsetici-etkisi',
            content: 'Papatya çayı, sinir sistemini sakinleştiren ve gevşetici etkisi olan bitkisel bir çaydır. Özellikle stresli günlerin sonunda...',
            background_image: '/images/blog/papatya.jpg',
            views: 723,
            published_at: '2024-01-08T16:45:00Z'
          },
          {
            id: 5,
            title: 'Zencefil ve İmmün Sistem',
            slug: 'zencefil-ve-immun-sistem',
            content: 'Zencefil, güçlü anti-inflamatuar ve antimikrobiyal özellikleri ile immün sistemi destekleyen harika bir bitkidir...',
            background_image: '/images/blog/zencefil.jpg',
            views: 1120,
            published_at: '2024-01-05T11:20:00Z'
          },
          {
            id: 6,
            title: 'Ekinezya ile Doğal Bağışıklık',
            slug: 'ekinezya-ile-dogal-bagisiklik',
            content: 'Ekinezya, bağışıklık sistemini güçlendiren en etkili bitkilerden biridir. Soğuk algınlığı ve grip belirtilerine karşı...',
            background_image: '/images/blog/ekinezya.jpg',
            views: 956,
            published_at: '2024-01-03T13:30:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Blog yazıları yüklenemedi:', error);
      // Hata durumunda demo veriler
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const BlogCard = ({ post }) => {
    return (
      <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-none shadow-lg overflow-hidden hover:scale-105 transition-all duration-300 border-b-4 border-rick-green hover:border-rick-purple hover:animate-slime-drip w-full">
        {/* Kart Arka Plan Resmi */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          {post.background_image ? (
            <div
              className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
              style={{ backgroundImage: `url(${post.background_image})` }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rick-green to-rick-purple flex items-center justify-center">
              <div className="text-6xl text-white animate-float">📖</div>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300" />

          {/* İçerik Overlay */}
          <div className="absolute inset-0 p-3 sm:p-4 lg:p-6 flex flex-col justify-end">
            {/* Başlık */}
            <h2 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-white mb-2 sm:mb-3 drop-shadow-lg leading-tight">
              {post.title}
            </h2>

            {/* Görüntülenme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2 text-white/80">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-sans">{post.views} görüntülenme</span>
              </div>

              {/* Okuma Butonu */}
              <Link
                to={`/blog/${post.slug}`}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-rick-green text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-none hover:bg-green-600 hover:scale-105 font-heading font-semibold text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2"
              >
                <span>Oku</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Kart İçeriği */}
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Yazı Önizlemesi */}
          <p className="text-gray-600 dark:text-gray-300 font-sans text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
            {post.content}
          </p>

          {/* Alt Bilgiler */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-sans">
              {new Date(post.published_at).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>

            <Link
              to={`/blog/${post.slug}`}
              className="text-rick-green hover:text-green-600 font-heading font-semibold text-xs sm:text-sm hover:scale-105 transition-all duration-300 self-start sm:self-auto"
            >
              Devamını Oku →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative z-0">
      <div className="relative z-0 min-h-screen backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          {/* Başlık */}
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white drop-shadow-2xl mb-3 sm:mb-4 animate-float">
              Blog Yazıları
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-sans text-gray-100 drop-shadow-lg max-w-2xl mx-auto">
              Şifallı bitkiler hakkında faydalı bilgiler ve sağlık önerileri
            </p>
          </div>

          {/* Blog Kartları */}
          <div className="px-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-none overflow-hidden animate-pulse border-b-4 border-gray-300">
                    <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"></div>
                    <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
                      <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-2 sm:h-3 bg-gray-300 rounded w-full"></div>
                      <div className="h-2 sm:h-3 bg-gray-300 rounded w-2/3"></div>
                      <div className="h-2 sm:h-3 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Eğer yazı yoksa */}
          {!loading && posts.length === 0 && (
            <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-none border-b-4 border-rick-green max-w-md mx-auto">
                <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6 text-rick-green animate-bounce-slow">📚</div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                  Henüz blog yazısı bulunmuyor
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-sans">
                  Yakında faydalı içeriklerle karşınızda olacağız
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RickBlog;