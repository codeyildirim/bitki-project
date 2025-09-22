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
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-green-600">Ana Sayfa</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-green-600">Ürünler</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-8xl">🌿</div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <span className="text-yellow-400 mr-1">⭐</span>
                <span className="text-gray-600">{product.rating || '0.0'}</span>
                <span className="text-gray-500 ml-1">({reviews.length} yorum)</span>
              </div>
              <span className="text-green-600 font-semibold">{product.category}</span>
            </div>
          </div>

          <div className="text-3xl font-bold text-green-600">
            {product.price.toLocaleString('tr-TR')} ₺
          </div>

          <div>
            <h3 className="font-semibold mb-2">Açıklama</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="font-semibold">Adet:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-20 p-2 border border-gray-300 rounded"
              />
            </div>
            <button
              onClick={addToCart}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Sepete Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t pt-8">
        <h3 className="text-2xl font-bold mb-6">Yorumlar ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">Henüz yorum yapılmamış.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{review.user_name}</div>
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span>{review.rating}/5</span>
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
                <div className="text-sm text-gray-500 mt-2">
                  {new Date(review.created_at).toLocaleDateString('tr-TR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;