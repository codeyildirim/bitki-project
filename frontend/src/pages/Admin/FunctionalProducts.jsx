import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FunctionalProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: null
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products || []);
      } else {
        // Demo veriler
        setProducts([
          { id: 1, name: 'Papatya Çayı', description: 'Doğal papatya çayı', price: 25.99, stock: 50, category: 'Çaylar' },
          { id: 2, name: 'Adaçayı', description: 'Organik adaçayı', price: 18.50, stock: 30, category: 'Çaylar' },
          { id: 3, name: 'Lavanta Yağı', description: 'Saf lavanta yağı', price: 45.00, stock: 20, category: 'Yağlar' }
        ]);
      }
    } catch (error) {
      console.error('Urunler yuklenemedi:', error);
      setProducts([
        { id: 1, name: 'Papatya Çayı', description: 'Doğal papatya çayı', price: 25.99, stock: 50, category: 'Çaylar' },
        { id: 2, name: 'Adaçayı', description: 'Organik adaçayı', price: 18.50, stock: 30, category: 'Çaylar' },
        { id: 3, name: 'Lavanta Yağı', description: 'Saf lavanta yağı', price: 45.00, stock: 20, category: 'Yağlar' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      } else {
        setCategories([
          { id: 1, name: 'Çaylar' },
          { id: 2, name: 'Yağlar' },
          { id: 3, name: 'Kapsüller' },
          { id: 4, name: 'Kremler' }
        ]);
      }
    } catch (error) {
      setCategories([
        { id: 1, name: 'Çaylar' },
        { id: 2, name: 'Yağlar' },
        { id: 3, name: 'Kapsüller' },
        { id: 4, name: 'Kremler' }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('stock', parseInt(formData.stock));
      formDataToSend.append('category_id', formData.category_id);

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const data = await response.json();
      if (data.success) {
        alert(editingProduct ? 'Urun guncellendi!' : 'Urun eklendi!');
        fetchProducts();
        resetForm();
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (error) {
      console.error('Urun islemi hatasi:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id || '',
      image: null
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Bu urunu silmek istediginizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Urun silindi!');
        fetchProducts();
      } else {
        alert('Silme hatasi: ' + data.message);
      }
    } catch (error) {
      console.error('Urun silme hatasi:', error);
      alert('Bir hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      image: null
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-mono">Urun Kontrolu</h1>
          <p className="text-gray-400 font-mono">Urun listesi ve stok takibi</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-red-900 text-red-200 px-6 py-2 rounded-lg hover:bg-red-800 transition-colors border border-red-700 font-mono"
        >
          {showAddForm ? 'IPTAL' : 'YENI URUN EKLE'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-black border border-red-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-400 mb-4 font-mono">
            {editingProduct ? 'URUN DUZENLE' : 'YENI URUN EKLE'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                Urun Adi *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                placeholder="Ornek: Papatya Cayi, Lavanta Yagi"
                required
              />
              <p className="text-xs text-gray-400 mt-1 font-mono">Urunun satis adini girin</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                Urun Kategorisi *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                required
              >
                <option value="">Kategori secin</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1 font-mono">Urunun hangi kategoriye ait oldugunu secin</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                Satis Fiyati (TL) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                placeholder="Ornek: 25.99"
                required
              />
              <p className="text-xs text-gray-400 mt-1 font-mono">Turk Lirasi cinsinden satis fiyati (KDV dahil)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                Stok Miktari (Adet) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                placeholder="Ornek: 50"
                required
              />
              <p className="text-xs text-gray-400 mt-1 font-mono">Depoda bulunan urun adedi</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                Urun Aciklamasi *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                placeholder="Urunun ozelliklerini, faydalari ve kullanim talimatlarini detayca aciklayin..."
                rows={3}
                required
              />
              <p className="text-xs text-gray-400 mt-1 font-mono">Musterilerin gorecegi detayli urun aciklamasi</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                Urun Gorseli
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-900 file:text-red-200 hover:file:bg-red-800 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1 font-mono">JPG, PNG veya WebP formatinda urun fotografi yukleyin (Maksimum 5MB)</p>
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingProduct ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  URUN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  KATEGORI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  FIYAT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  STOK
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  ISLEMLER
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{product.name}</div>
                      <div className="text-sm text-gray-400">{product.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {product.category || 'Kategorisiz'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {product.price.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.stock > 10
                        ? 'bg-green-100 text-green-800'
                        : product.stock > 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} adet
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-green-400 hover:text-green-300 font-mono"
                    >
                      DUZENLE
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-400 hover:text-red-300 font-mono"
                    >
                      SIL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-red-400 font-mono">[EMPTY]</div>
            <h3 className="text-xl font-semibold text-white mb-2 font-mono">Henuz urun yok</h3>
            <p className="text-gray-400 mb-6 font-mono">Ilk urununu ekleyerek basla</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-red-900 text-red-200 px-6 py-2 rounded-lg hover:bg-red-800 transition-colors border border-red-700 font-mono"
            >
              ILK URUNU EKLE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunctionalProducts;