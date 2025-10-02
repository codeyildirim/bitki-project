import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';

const EnhancedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const ProductCard = ({ product }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const toggleFavorite = (e) => {
      e.preventDefault();
      setIsFavorite(!isFavorite);
    };

    const addToCart = (e) => {
      e.preventDefault();
      console.log('Sepete eklendi:', product.name);
    };

    return (
      <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-none shadow-lg overflow-hidden hover:scale-105 transition-all duration-300 border-b-4 border-rick-green hover:border-rick-purple hover:animate-slime-drip w-full">
        {/* Ürün Görseli */}
        <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-rick-green">
              🌿
            </div>
          )}

          {/* İndirim Etiketi */}
          {product.discount_percentage > 0 && (
            <div className="absolute top-3 left-3">
              <span className="bg-rick-pink text-white text-sm px-3 py-1 rounded-none font-heading font-semibold animate-bounce-slow">
                %{product.discount_percentage} İndirim
              </span>
            </div>
          )}

          {/* Öne Çıkan Etiket */}
          {product.is_featured && (
            <div className="absolute top-3 right-3">
              <span className="bg-rick-purple text-white text-sm px-3 py-1 rounded-none font-heading font-semibold">
                ⭐ Öne Çıkan
              </span>
            </div>
          )}

          {/* Favoriye Ekleme */}
          <button
            onClick={toggleFavorite}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-none flex items-center justify-center transition-all duration-300 ${
              isFavorite
                ? 'bg-rick-pink text-white'
                : 'bg-white/90 text-gray-600 hover:bg-rick-pink hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="bg-rick-green hover:bg-green-600 text-white px-6 py-3 rounded-none font-heading font-semibold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}</span>
            </button>
          </div>
        </div>

        {/* Ürün Bilgileri */}
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Kategori */}
          <div className="mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-rick-green font-heading font-semibold bg-green-100 dark:bg-green-900/30 px-2 sm:px-3 py-1 rounded-none">
              {product.category_name}
            </span>
          </div>

          {/* Ürün Adı */}
          <h3 className="text-sm sm:text-base lg:text-xl font-heading font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-rick-green transition-colors leading-tight line-clamp-2">
            <Link to={`/products/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          {/* Yıldız Puanı */}
          {product.avg_rating && (
            <div className="flex items-center mb-2 sm:mb-3">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      star <= product.avg_rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1 sm:ml-2 font-sans">
                ({product.review_count || 0})
              </span>
            </div>
          )}

          {/* Fiyat */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              {product.discount_percentage > 0 ? (
                <>
                  <span className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-rick-green">
                    ₺{product.discounted_price || product.price}
                  </span>
                  <span className="text-sm sm:text-base lg:text-lg font-sans text-gray-500 line-through">
                    ₺{product.price}
                  </span>
                </>
              ) : (
                <span className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-rick-green">
                  ₺{product.price}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1 font-sans">
              <Eye className="w-3 h-3" />
              <span>{product.views || 0}</span>
            </div>
          </div>

          {/* Stok Durumu */}
          <div className="mb-3 sm:mb-4">
            <span className={`text-xs sm:text-sm font-heading font-medium ${
              product.stock > 10
                ? 'text-rick-green'
                : product.stock > 0
                  ? 'text-orange-500'
                  : 'text-red-500'
            }`}>
              {product.stock > 0 ? `${product.stock} adet stokta` : 'Stokta yok'}
            </span>
          </div>

          {/* Butonlar */}
          <div className="space-y-2 sm:space-y-3">
            <Link
              to={`/products/${product.slug}`}
              className="block w-full text-center bg-rick-purple hover:bg-purple-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-none font-heading font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300 hover:scale-105 hover:animate-slime-wiggle"
            >
              Ürünü İncele
            </Link>

            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="w-full border-2 border-rick-green text-rick-green hover:bg-rick-green hover:text-white py-2 px-3 sm:px-4 rounded-none font-heading font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 hover:scale-105"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{product.stock === 0 ? 'Stokta Yok' : 'Hızlı Sepet'}</span>
            </button>
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
              Ürünlerimizi Keşfet
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-sans text-gray-100 drop-shadow-lg max-w-2xl mx-auto">
              Doğal ve kaliteli şifalı bitkilerimizle sağlığınıza kavuşun
            </p>
          </div>

          {/* Ürünler Grid'i */}
          <div className="px-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-none overflow-hidden animate-pulse border-b-4 border-gray-300">
                    <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"></div>
                    <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
                      <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-4 sm:h-5 lg:h-6 bg-gray-300 rounded w-2/3"></div>
                      <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-6 sm:h-7 lg:h-8 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Eğer ürün yoksa */}
          {!loading && products.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-none border-b-4 border-rick-green max-w-md mx-auto">
                <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6 text-rick-green animate-bounce-slow">🌿</div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Henüz ürün bulunmuyor
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-sans">
                  Yakında harika ürünlerle karşınızda olacağız
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProducts;