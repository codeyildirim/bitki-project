import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
        setReviews(data.data.reviews || []);
      }
    } catch (error) {
      console.error('Ürün yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    // Sepete ekleme logic'i
    console.log('Sepete eklendi:', { productId: id, quantity });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Ürün bulunamadı</h2>
        <Link to="/products" className="text-green-600 hover:text-green-700">
          Ürünlere geri dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-0">
      <div className="relative z-0 min-h-screen backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-white font-sans">
              <Link to="/" className="hover:text-rick-green transition-colors">Ana Sayfa</Link>
              <span>/</span>
              <Link to="/products" className="hover:text-rick-green transition-colors">Ürünler</Link>
              <span>/</span>
              <span className="text-rick-purple font-semibold">{product.name}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {/* Product Image */}
            <div className="space-y-4 order-1">
              <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-none overflow-hidden border-b-4 border-rick-green">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-6xl sm:text-7xl lg:text-8xl text-rick-green animate-float">🌿</div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-none border-b-4 border-rick-purple space-y-4 sm:space-y-6 order-2">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{product.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="text-gray-600 dark:text-gray-300 font-sans text-sm sm:text-base">{product.rating || '0.0'}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1 font-sans text-sm sm:text-base">({reviews.length} yorum)</span>
                  </div>
                  <span className="text-rick-green font-heading font-semibold bg-green-100 dark:bg-green-900/30 px-2 sm:px-3 py-1 rounded-none text-sm sm:text-base w-fit">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-rick-green">
                {product.price.toLocaleString('tr-TR')} ₺
              </div>

              <div>
                <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-base sm:text-lg">Açıklama</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-sans text-sm sm:text-base">{product.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <label className="font-heading font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Adet:</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-16 sm:w-20 p-2 border-2 border-rick-green rounded-none font-sans text-sm sm:text-base"
                  />
                </div>
                <button
                  onClick={addToCart}
                  className="w-full sm:flex-1 bg-rick-green text-white py-3 sm:py-4 px-4 sm:px-6 rounded-none hover:bg-green-600 hover:scale-105 hover:animate-slime-drip transition-all duration-300 font-heading font-semibold text-base sm:text-lg"
                >
                  Sepete Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-none border-b-4 border-rick-pink">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Yorumlar ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 font-sans text-base sm:text-lg">Henüz yorum yapılmamış.</p>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-none border-l-4 border-rick-purple hover:scale-105 transition-transform duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="font-heading font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{review.user_name}</div>
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span className="font-sans text-gray-600 dark:text-gray-300 text-sm sm:text-base">{review.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-sans text-sm sm:text-base leading-relaxed">{review.comment}</p>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 font-sans">
                      {new Date(review.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;