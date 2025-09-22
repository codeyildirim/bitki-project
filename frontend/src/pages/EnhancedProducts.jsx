import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import DynamicBackground from '../components/DynamicBackground';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  Star,
  ShoppingCart,
  Play,
  Heart,
  Eye,
  SlidersHorizontal,
  X
} from 'lucide-react';

const EnhancedProducts = () => {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    hasVideo: searchParams.get('hasVideo') === 'true'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [cartItems, setCartItems] = useState(new Set());

  // Infinite scroll refs
  const observerRef = useRef();
  const lastProductElementRef = useCallback(node => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && currentPage < totalPages) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, currentPage, totalPages]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [currentPage, filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data || []);
      } else {
        // Demo kategoriler
        setCategories([
          { id: 1, name: 'Şifalı Bitkiler', slug: 'sifali-bitkiler', product_count: 25 },
          { id: 2, name: 'Bitki Çayları', slug: 'bitki-caylari', product_count: 18 },
          { id: 3, name: 'Baharatlar', slug: 'baharatlar', product_count: 12 },
          { id: 4, name: 'Aromaterapi', slug: 'aromaterapi', product_count: 8 },
          { id: 5, name: 'Organik Ürünler', slug: 'organik', product_count: 15 }
        ]);
      }
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== false))
      });

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      } else {
        // Demo ürünler
        setProducts([
          {
            id: 1,
            name: 'Organik Adaçayı',
            slug: 'organik-adacayi',
            description: 'Doğal ve organik adaçayı yaprakları, sindirim problemleri için ideal.',
            price: 45.90,
            image_url: '/images/products/adacayi.jpg',
            stock: 50,
            category_name: 'Şifalı Bitkiler',
            is_featured: true,
            views: 245
          },
          {
            id: 2,
            name: 'Papatya Çayı',
            slug: 'papatya-cayi',
            description: 'Sakinleştirici etkili organik papatya çayı, uyku kalitesi için.',
            price: 32.50,
            image_url: '/images/products/papatya.jpg',
            stock: 30,
            category_name: 'Bitki Çayları',
            is_featured: false,
            views: 189
          },
          {
            id: 3,
            name: 'Kurkuma Tozu',
            slug: 'kurkuma-tozu',
            description: 'Anti-inflamatuar özellikli doğal kurkuma tozu.',
            price: 28.75,
            image_url: '/images/products/kurkuma.jpg',
            stock: 25,
            category_name: 'Baharatlar',
            is_featured: true,
            views: 156
          },
          {
            id: 4,
            name: 'Lavanta Yağı',
            slug: 'lavanta-yagi',
            description: 'Saf lavanta esansiyel yağı, aromaterapi için ideal.',
            price: 125.00,
            image_url: '/images/products/lavanta.jpg',
            stock: 15,
            category_name: 'Aromaterapi',
            is_featured: false,
            views: 98
          },
          {
            id: 5,
            name: 'Yeşil Çay',
            slug: 'yesil-cay',
            description: 'Antioksidan açısından zengin organik yeşil çay.',
            price: 58.90,
            image_url: '/images/products/yesil-cay.jpg',
            stock: 40,
            category_name: 'Bitki Çayları',
            is_featured: true,
            views: 312
          },
          {
            id: 6,
            name: 'Ginkgo Biloba',
            slug: 'ginkgo-biloba',
            description: 'Hafıza ve konsantrasyon destekleyici ginkgo biloba kapsülleri.',
            price: 89.90,
            image_url: '/images/products/ginkgo.jpg',
            stock: 20,
            category_name: 'Şifalı Bitkiler',
            is_featured: false,
            views: 167
          }
        ]);
      }
    } catch (error) {
      console.error('Ürün yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);

    // URL güncelle
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== '' && v !== false) {
        newParams.set(k, v);
      }
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '', search: '', sort: 'newest', minPrice: '', maxPrice: '', inStock: false
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    setSearchParams({});
  };

  const addToCart = async (product) => {
    try {
      // Önce localStorage'a ekle (guest kullanıcılar için)
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(item => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(cart));

      // Eğer kullanıcı giriş yapmışsa API'ye de gönder
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity: 1
          })
        });
      }

      alert('Ürün sepete eklendi!');
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      alert('Ürün sepete eklenirken hata oluştu');
    }
  };

  const ProductCard = ({ product, isListMode = false }) => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const videoRef = useRef(null);

    const handleMouseEnter = () => {
      setHoveredProduct(product.id);
      if (product.videos && product.videos.length > 0 && videoRef.current) {
        setIsVideoPlaying(true);
        videoRef.current.play();
      }
    };

    const handleMouseLeave = () => {
      setHoveredProduct(null);
      setIsVideoPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };

    const toggleFavorite = (e) => {
      e.preventDefault();
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(product.id)) {
          newFavorites.delete(product.id);
        } else {
          newFavorites.add(product.id);
        }
        return newFavorites;
      });
    };

    const addToCart = (e) => {
      e.preventDefault();
      setCartItems(prev => new Set(prev).add(product.id));
      // TODO: Gerçek sepet mantığı buraya eklenecek
    };

    const images = product.images || [];
    const videos = product.videos || [];
    const hasMultipleMedia = images.length + videos.length > 1;

    return (
      <div
        className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-200/50 dark:border-gray-700/50 ${
          isListMode ? 'flex' : 'hover:scale-[1.02]'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Media Container */}
        <div className={`${isListMode ? 'w-48 h-32' : 'h-72'} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden relative`}>
          {/* Main Media Display */}
          {isVideoPlaying && videos.length > 0 ? (
            <video
              ref={videoRef}
              src={videos[0]}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
          ) : images.length > 0 ? (
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-green-600 dark:text-green-400">
              🌿
            </div>
          )}

          {/* Media Navigation Dots */}
          {hasMultipleMedia && !isListMode && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {[...images, ...videos].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(Math.min(index, images.length - 1))}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Video Indicator */}
          {videos.length > 0 && (
            <div className="absolute bottom-3 right-3">
              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                <Play className="w-3 h-3" />
                <span>Video</span>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 space-y-1">
            {product.is_featured && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                ⭐ Öne Çıkan
              </span>
            )}
            {product.stock < 10 && product.stock > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                🔥 Son {product.stock} adet
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                😞 Tükendi
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 space-y-2">
            <button
              onClick={toggleFavorite}
              className={`w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all ${
                favorites.has(product.id) ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
            </button>
            <Link
              to={`/products/${product.slug}`}
              className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Add to Cart Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 ${isListMode ? 'flex-1' : ''}`}>
          <div className="mb-3">
            <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              {product.category_name}
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors leading-tight">
            <Link to={`/products/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Rating */}
          {product.avg_rating && (
            <div className="flex items-center mb-3">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= product.avg_rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                ({product.review_count || 0})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₺{product.price}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{product.views || 0}</span>
            </div>
          </div>

          {/* Stock info */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Stok:</span>
              <span className={`font-medium ${
                product.stock > 10
                  ? 'text-green-600 dark:text-green-400'
                  : product.stock > 0
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-red-600 dark:text-red-400'
              }`}>
                {product.stock > 0 ? `${product.stock} adet` : 'Tükendi'}
              </span>
            </div>
          </div>

          {!isListMode && (
            <div className="space-y-3">
              <Link
                to={`/products/${product.slug}`}
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Ürünü İncele
              </Link>

              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="w-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white py-2 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{product.stock === 0 ? 'Stokta Yok' : 'Hızlı Sepet'}</span>
              </button>
            </div>
          )}

          {isListMode && (
            <div className="flex items-center space-x-3">
              <Link
                to={`/products/${product.slug}`}
                className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                İncele
              </Link>
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? 'Tükendi' : 'Sepete Ekle'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative">
      {/* Dynamic Background */}
      <DynamicBackground page="products" />

      <div className="relative z-0 min-h-screen backdrop-blur-sm py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🌿 Ürünlerimiz
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Doğanın gücünü keşfedin, sağlıklı yaşamın kapılarını açın
          </p>
        </div>

        {/* Filters Toggle (Mobile) */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg font-medium"
          >
            🔧 Filtreler {showFilters ? '▲' : '▼'}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">🔧 Filtreler</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Temizle
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Ürün Ara</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Ürün adı, açıklama ara..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 transition-all"
                  />
                  {filters.search && (
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📂 Kategoriler
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.slug}>
                      {category.name} ({category.product_count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  💰 Fiyat Aralığı
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min ₺"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max ₺"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    📦 Sadece stokta olanlar
                  </span>
                </label>
              </div>

              {/* Video Filter */}
              <div className="mb-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.hasVideo}
                    onChange={(e) => handleFilterChange('hasVideo', e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                    <Play className="w-4 h-4" />
                    <span>Sadece videolu ürünler</span>
                  </span>
                </label>
              </div>

              {/* Quick Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  🚀 Hızlı Erişim
                </h3>
                <div className="space-y-2">
                  {categories.slice(0, 5).map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleFilterChange('category', category.slug)}
                      className="block w-full text-left text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                    >
                      {category.name} →
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {loading ? 'Yükleniyor...' : `${products.length} ürün bulundu`}
                </div>

                <div className="flex items-center space-x-4">
                  {/* View Mode */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'grid'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      <span>Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'list'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span>Liste</span>
                    </button>
                  </div>

                  {/* Sort */}
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 text-sm"
                  >
                    <option value="newest">🆕 En Yeni</option>
                    <option value="oldest">📅 En Eski</option>
                    <option value="price_low">💰 Fiyat (Düşük → Yüksek)</option>
                    <option value="price_high">💰 Fiyat (Yüksek → Düşük)</option>
                    <option value="popular">🔥 En Popüler</option>
                    <option value="name_asc">🔤 A → Z</option>
                    <option value="name_desc">🔤 Z → A</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden animate-pulse border border-gray-200/50 dark:border-gray-700/50">
                    <div className="h-72 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-3/4"></div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-6'
                }>
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      ref={index === products.length - 1 ? lastProductElementRef : null}
                    >
                      <ProductCard
                        product={product}
                        isListMode={viewMode === 'list'}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12 space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ← Önceki
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + Math.max(1, currentPage - 2);
                      return page <= totalPages ? (
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
                      ) : null;
                    })}

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
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🔍</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ürün Bulunamadı
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Aradığınız kriterlere uygun ürün bulunamadı. Filtrelerinizi değiştirmeyi deneyin.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Tüm Ürünleri Görüntüle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EnhancedProducts;