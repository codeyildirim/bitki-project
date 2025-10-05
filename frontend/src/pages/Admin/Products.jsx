import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

const AdminProducts = () => {
  const { adminApi } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    images: [],
    tiered_pricing: [],
    discount_badges: false
  });
  const [isTieredPricing, setIsTieredPricing] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/api/products');
      if (response.data.success) {
        setProducts(response.data.data.products || response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Use production API endpoint for categories
      const response = await fetch('https://bitki-project.onrender.com/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();

      Object.keys(formData).forEach(key => {
        if (key === 'images' && formData[key].length > 0) {
          formData[key].forEach(file => formDataObj.append('images', file));
        } else if (key === 'tiered_pricing' && formData[key].length > 0) {
          formDataObj.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'images' && key !== 'tiered_pricing') {
          formDataObj.append(key, formData[key]);
        }
      });

      // Debug: Log FormData contents
      console.log('📦 FormData Contents:');
      for (let [key, value] of formDataObj.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}:`, `File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      let response;
      if (editingProduct) {
        response = await adminApi.put(`/api/admin/products/${editingProduct.id}`, formDataObj);
      } else {
        response = await adminApi.post('/api/admin/products', formDataObj);
      }

      if (response.data.success) {
        loadProducts();
        setShowForm(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category_id: '',
          images: [],
          tiered_pricing: [],
          discount_badges: false
        });
        setIsTieredPricing(false);
      } else {
        alert('Hata: ' + response.data.message);
      }
    } catch (error) {
      console.error('Product save error:', error);
      alert('Ürün kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const tieredPricing = product.tiered_pricing ? (typeof product.tiered_pricing === 'string' ? JSON.parse(product.tiered_pricing) : product.tiered_pricing) : [];
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || '',
      images: [],
      tiered_pricing: tieredPricing,
      discount_badges: product.discount_badges === 1 || product.discount_badges === true
    });
    setIsTieredPricing(tieredPricing.length > 0);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await adminApi.delete(`/api/admin/products/${productId}`);
      if (response.data.success) {
        loadProducts();
      } else {
        alert('Hata: ' + response.data.message);
      }
    } catch (error) {
      console.error('Product delete error:', error);
      alert('Ürün silinirken hata oluştu');
    }
  };

  const toggleFeatured = async (productId) => {
    try {
      const response = await adminApi.patch(`/api/admin/products/${productId}/featured`);
      if (response.data.success) {
        loadProducts();
        alert(response.data.data.message);
      } else {
        alert(response.data.message || 'Öne çıkan durumu güncellenemedi');
      }
    } catch (error) {
      console.error('Toggle featured error:', error);
      alert('Bağlantı hatası');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono text-xl">
          [LOADING] Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-mono">[PROD] Product Control</h1>
          <p className="text-gray-400 font-mono">Manage products, inventory, and catalog items</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              stock: '',
              category_id: '',
              images: [],
              tiered_pricing: [],
              discount_badges: false
            });
            setIsTieredPricing(false);
          }}
          className="bg-green-900 text-green-200 px-4 py-2 rounded hover:bg-green-800 transition-colors font-mono border border-green-700"
        >
          [+] Yeni Ürün
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="bg-black border border-red-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white font-mono">
              {editingProduct ? '[EDIT] Ürün Düzenle' : '[NEW] Yeni Ürün Ekle'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-red-400 hover:text-red-300 font-mono text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Kategori
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Kategori Seç</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Fiyat (TL)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                  Stok Miktarı
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-red-300 mb-2 font-mono">
                Ürün Resimleri
              </label>
              <input
                type="file"
                name="images"
                onChange={handleInputChange}
                multiple
                accept="image/*"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white focus:ring-2 focus:ring-red-500"
              />
              <p className="text-gray-400 text-sm mt-1 font-mono">
                Maksimum 10 resim seçebilirsiniz
              </p>
            </div>

            {/* Tiered Pricing Section */}
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-yellow-300 font-mono">
                  💰 Çoklu Paket Fiyatlandırma
                </label>
                <button
                  type="button"
                  onClick={() => setIsTieredPricing(!isTieredPricing)}
                  className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                    isTieredPricing
                      ? 'bg-green-900 text-green-200 border border-green-700'
                      : 'bg-gray-700 text-gray-300 border border-gray-600'
                  }`}
                >
                  {isTieredPricing ? '[ACTIVE] Aktif' : '[INACTIVE] Kapalı'}
                </button>
              </div>

              {isTieredPricing && (
                <div className="space-y-3 bg-gray-900 p-4 rounded border border-yellow-700">
                  {formData.tiered_pricing.sort((a, b) => a.quantity - b.quantity).map((tier, index) => {
                    const unitPrice = tier.quantity > 0 && tier.price > 0 ? (tier.price / tier.quantity).toFixed(2) : '0.00';
                    return (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 font-mono">Paket Sayısı</label>
                          <input
                            type="number"
                            value={tier.quantity}
                            onChange={(e) => {
                              const newTiers = [...formData.tiered_pricing];
                              newTiers[index].quantity = parseInt(e.target.value);
                              setFormData({ ...formData, tiered_pricing: newTiers });
                            }}
                            min="1"
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                            placeholder="1"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 font-mono">Fiyat (TL)</label>
                          <input
                            type="number"
                            value={tier.price}
                            onChange={(e) => {
                              const newTiers = [...formData.tiered_pricing];
                              newTiers[index].price = parseFloat(e.target.value);
                              setFormData({ ...formData, tiered_pricing: newTiers });
                            }}
                            min="0"
                            step="0.01"
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                            placeholder="200.00"
                          />
                          <div className="text-xs text-green-400 font-mono mt-1">
                            ≈ {unitPrice} ₺/paket
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newTiers = formData.tiered_pricing.filter((_, i) => i !== index);
                            setFormData({ ...formData, tiered_pricing: newTiers });
                          }}
                          className="mt-5 px-3 py-2 bg-red-900 text-red-200 rounded hover:bg-red-800 font-mono text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        tiered_pricing: [...formData.tiered_pricing, { quantity: 1, price: 0 }]
                      });
                    }}
                    className="w-full px-4 py-2 bg-yellow-900 text-yellow-200 rounded hover:bg-yellow-800 font-mono text-sm border border-yellow-700"
                  >
                    [+] Yeni Paket Ekle
                  </button>

                  <div className="text-xs text-gray-400 font-mono mt-2 p-2 bg-gray-800 rounded">
                    💡 Örnek: 1 paket = 200 TL, 3 paket = 500 TL, 6 paket = 900 TL
                  </div>
                </div>
              )}
            </div>

            {/* Campaign Badges Toggle */}
            {isTieredPricing && formData.tiered_pricing.length > 0 && (
              <div className="border-t border-gray-700 pt-4">
                <div className="bg-gray-900 p-4 rounded border border-purple-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="block text-sm font-medium text-purple-300 font-mono mb-1">
                        🏷️ Kampanya Etiketleri
                      </label>
                      <p className="text-xs text-gray-400 font-mono">
                        Fiyat farkına göre otomatik % tasarruf etiketi gösterilir.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discount_badges: !formData.discount_badges })}
                      className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                        formData.discount_badges
                          ? 'bg-purple-900 text-purple-200 border border-purple-700'
                          : 'bg-gray-700 text-gray-300 border border-gray-600'
                      }`}
                    >
                      {formData.discount_badges ? '[ON] Açık' : '[OFF] Kapalı'}
                    </button>
                  </div>
                  {formData.discount_badges && (
                    <div className="text-xs text-green-400 font-mono mt-2 p-2 bg-gray-800 rounded">
                      ✅ Kullanıcılar paket kartlarında "%XX Tasarruf" etiketini görecek
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors font-mono"
              >
                [CANCEL] İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-900 text-red-200 rounded hover:bg-red-800 transition-colors font-mono border border-red-700 disabled:opacity-50"
              >
                {loading ? '[SAVING] Kaydediliyor...' : editingProduct ? '[UPDATE] Güncelle' : '[SAVE] Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-black border border-red-900 rounded-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white font-mono mb-4">[LIST] Ürünler</h2>

          {loading ? (
            <div className="text-center text-gray-400 py-8 font-mono">
              [LOADING] Ürünler yükleniyor...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-400 py-8 font-mono">
              [EMPTY] Henüz ürün yok
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-red-900">
                    <th className="text-left p-3 text-red-300 font-mono">ID</th>
                    <th className="text-left p-3 text-red-300 font-mono">Resim</th>
                    <th className="text-left p-3 text-red-300 font-mono">Ad</th>
                    <th className="text-left p-3 text-red-300 font-mono">Kategori</th>
                    <th className="text-left p-3 text-red-300 font-mono">Fiyat</th>
                    <th className="text-left p-3 text-red-300 font-mono">Stok</th>
                    <th className="text-left p-3 text-red-300 font-mono">Durum</th>
                    <th className="text-left p-3 text-red-300 font-mono">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="p-3 text-gray-300 font-mono">#{product.id}</td>
                      <td className="p-3">
                        {(() => {
                          try {
                            const images = product.images ? JSON.parse(product.images) : [];
                            const firstImage = Array.isArray(images) ? images[0] : images;

                            if (firstImage) {
                              return (
                                <img
                                  src={`https://bitki-project.onrender.com${firstImage}`}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded border border-gray-700"
                                />
                              );
                            }
                          } catch (error) {
                            console.warn('Image parse error for product:', product.id, error);
                          }

                          return (
                            <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center border border-gray-600">
                              <span className="text-gray-500 text-xs font-mono">IMG</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-3 text-white font-mono">{product.name}</td>
                      <td className="p-3 text-gray-300 font-mono">
                        {product.category_name || categories.find(c => c.id === product.category_id)?.name || 'N/A'}
                      </td>
                      <td className="p-3 text-green-400 font-mono">₺{product.price}</td>
                      <td className="p-3 font-mono">
                        <span className={`${product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className={`px-2 py-1 rounded text-xs ${product.is_active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                          {product.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-400 hover:text-blue-300 font-mono text-sm"
                          >
                            [EDIT]
                          </button>
                          <button
                            onClick={() => toggleFeatured(product.id)}
                            className={`font-mono text-sm ${product.is_featured ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-yellow-400'}`}
                          >
                            {product.is_featured ? '[★]' : '[☆]'}
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-400 hover:text-red-300 font-mono text-sm"
                          >
                            [DEL]
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;