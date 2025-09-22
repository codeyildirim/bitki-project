import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const EnhancedBlogPost = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchRelatedPosts();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.data);
        setComments(data.data.comments || []);
      } else {
        // Demo veri
        setPost({
          id: 1,
          title: 'Adaçayının Faydaları ve Kullanım Alanları',
          content: `
            <h2>Adaçayı Nedir?</h2>
            <p>Adaçayı (Salvia officinalis), Lamiaceae familyasından çok yıllık, otsu bir bitkidir. Akdeniz bölgesine özgü olan bu bitki, antik çağlardan beri şifalı özellikleri ile bilinmektedir.</p>

            <h2>Adaçayının Faydaları</h2>
            <h3>1. Sindirimi Destekler</h3>
            <p>Adaçayı, sindirim sistemini rahatlatır ve mide problemlerini azaltır. Özellikle yemek sonrası içilen adaçayı çayı, hazımsızlık şikayetlerini giderir.</p>

            <h3>2. Antiseptik Özellikleri</h3>
            <p>Güçlü antiseptik özelliği sayesinde ağız ve boğaz enfeksiyonlarında kullanılır. Gargara olarak kullanıldığında etkili sonuçlar verir.</p>

            <h3>3. Hafızayı Güçlendirir</h3>
            <p>Yapılan araştırmalar, adaçayının kognitif fonksiyonları desteklediğini ve hafızayı güçlendirdiğini göstermektedir.</p>

            <h2>Kullanım Şekilleri</h2>
            <ul>
              <li><strong>Çay olarak:</strong> 1 çay kaşığı kurutulmuş adaçayı yaprağını 1 bardak kaynar suya atıp 5-10 dakika demleyin.</li>
              <li><strong>Gargara olarak:</strong> Hazırladığınız çayı ılık halde gargara yapın.</li>
              <li><strong>Buhar banyosu:</strong> Solunum yolu problemleri için buhar banyosu yapabilirsiniz.</li>
            </ul>

            <h2>Dikkat Edilmesi Gerekenler</h2>
            <p><em>Hamile ve emziren kadınların dikkatli kullanması önerilir. Aşırı tüketim zararlı olabilir. Günde 2-3 fincan çay şeklinde tüketim yeterlidir.</em></p>
          `,
          excerpt: 'Adaçayı, antik çağlardan beri bilinen ve birçok hastalığın tedavisinde kullanılan değerli bir bitkidir.',
          image_url: '/images/blog/adacayi.jpg',
          author_name: 'Dr. Ayşe Botanik',
          published_at: '2024-01-15T10:00:00Z',
          views: 1250
        });
        setComments([
          {
            id: 1,
            author_name: 'Mehmet K.',
            content: 'Çok faydalı bir yazı olmuş. Adaçayını düzenli kullanıyorum ve gerçekten etkili.',
            created_at: '2024-01-16T14:30:00Z'
          },
          {
            id: 2,
            author_name: 'Ayşe Y.',
            content: 'Gargara olarak kullandığımda boğaz ağrım geçti. Teşekkürler bu bilgi için.',
            created_at: '2024-01-17T09:15:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Blog yazısı yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const response = await fetch('/api/blog?limit=3');
      const data = await response.json();

      if (data.success) {
        setRelatedPosts(data.data.filter(p => p.slug !== slug) || []);
      } else {
        // Demo veriler
        setRelatedPosts([
          {
            id: 2,
            title: 'Doğal Detoks İçin En Etkili Bitkiler',
            slug: 'dogal-detoks-bitkileri',
            image_url: '/images/blog/detoks.jpg'
          },
          {
            id: 3,
            title: 'Kış Çayları: Bağışıklık Güçlendiren Karışımlar',
            slug: 'kis-caylari-bagisiklik',
            image_url: '/images/blog/kis-caylari.jpg'
          }
        ]);
      }
    } catch (error) {
      console.error('İlgili yazılar yükleme hatası:', error);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Yorum yapabilmek için giriş yapmalısınız');
      return;
    }

    if (commentText.trim().length < 10) {
      alert('Yorumunuz en az 10 karakter olmalıdır');
      return;
    }

    setIsSubmittingComment(true);

    try {
      const response = await fetch(`/api/blog/${slug}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: commentText })
      });

      const data = await response.json();

      if (data.success) {
        alert('Yorumunuz başarıyla gönderildi. Onay bekliyor.');
        setCommentText('');
      } else {
        alert(data.message || 'Yorum gönderilemedi');
      }
    } catch (error) {
      console.error('Yorum gönderme hatası:', error);
      alert('Yorum gönderilirken hata oluştu');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sharePost = async (platform) => {
    const url = window.location.href;
    const title = post?.title || '';

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          alert('Link kopyalandı!');
        } catch (error) {
          console.error('Link kopyalama hatası:', error);
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Blog yazısı bulunamadı
          </h1>
          <Link
            to="/blog"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            ← Blog'a geri dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-green-600 dark:hover:text-green-400">Ana Sayfa</Link>
            <span>→</span>
            <Link to="/blog" className="hover:text-green-600 dark:hover:text-green-400">Blog</Link>
            <span>→</span>
            <span className="text-gray-900 dark:text-white">{post.title}</span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center space-x-2">
                  <span>👤</span>
                  <span>{post.author_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📅</span>
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>👁️</span>
                  <span>{post.views} görüntülenme</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>💬</span>
                  <span>{comments.length} yorum</span>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Paylaş:</span>
                <button
                  onClick={() => sharePost('twitter')}
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                >
                  🐦 Twitter
                </button>
                <button
                  onClick={() => sharePost('facebook')}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  📘 Facebook
                </button>
                <button
                  onClick={() => sharePost('whatsapp')}
                  className="text-green-600 hover:text-green-700 transition-colors"
                >
                  📱 WhatsApp
                </button>
                <button
                  onClick={() => sharePost('copy')}
                  className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  📋 Kopyala
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {post.image_url && (
              <div className="h-64 lg:h-96 overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              <div
                className="prose prose-lg max-w-none dark:prose-invert prose-green prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Etiketler:</span>
                  {['adaçayı', 'şifalı-bitkiler', 'doğal-tedavi', 'bitki-çayı'].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="p-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                💬 Yorumlar ({comments.length})
              </h3>

              {/* Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={submitComment} className="mb-8">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Yorumunuz
                    </label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Yorumunuzu yazın... (En az 10 karakter)"
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows="4"
                      minLength="10"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingComment || commentText.trim().length < 10}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmittingComment ? 'Gönderiliyor...' : 'Yorum Gönder'}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Yorumunuz moderasyon sonrası yayınlanacaktır.
                  </p>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-blue-700 dark:text-blue-300">
                    Yorum yapmak için <Link to="/auth/login" className="font-medium underline">giriş yapın</Link> veya <Link to="/auth/register" className="font-medium underline">kayıt olun</Link>.
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-300 font-semibold">
                            {comment.author_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {comment.author_name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(comment.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Henüz yorum yapılmamış. İlk yorumu siz yapın!
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  🔗 İlgili Yazılar
                </h3>
                <div className="space-y-4">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="block group"
                    >
                      <div className="flex space-x-3">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {relatedPost.image_url ? (
                            <img
                              src={relatedPost.image_url}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              🌿
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {relatedPost.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-3">📧 E-Bülten</h3>
              <p className="text-green-100 text-sm mb-4">
                Yeni blog yazılarından haberdar olmak için abone olun
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="w-full px-3 py-2 rounded text-gray-900 text-sm"
                />
                <button
                  type="submit"
                  className="w-full bg-white text-green-600 py-2 rounded font-medium text-sm hover:bg-gray-100 transition-colors"
                >
                  Abone Ol
                </button>
              </form>
            </div>

            {/* Popular Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                🏷️ Popüler Etiketler
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'şifalı-bitkiler', 'bitki-çayı', 'doğal-tedavi', 'detoks',
                  'bağışıklık', 'wellness', 'organik', 'aromaterapi'
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs hover:bg-green-100 dark:hover:bg-green-900 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBlogPost;