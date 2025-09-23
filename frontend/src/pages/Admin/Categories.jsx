import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

const Categories = () => {
  const { adminApi } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    image_file: null,
    parent_id: null
  });
  const [imageType, setImageType] = useState('url'); // 'url' or 'file'

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Use adminApi for proper token authentication
      const response = await adminApi.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // FormData kullanarak hem metin hem dosya gönder
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);
      submitData.append('description', formData.description);
      if (formData.parent_id) {
        submitData.append('parent_id', formData.parent_id);
      }

      // Resim tipine göre veri ekle
      if (imageType === 'file' && formData.image_file) {
        submitData.append('image', formData.image_file);
      } else if (imageType === 'url' && formData.image_url) {
        submitData.append('image_url', formData.image_url);
      }

      // Use adminApi with proper token
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = editingCategory
        ? await adminApi.put(`/api/categories/${editingCategory.id}`, submitData, config)
        : await adminApi.post('/api/categories', submitData, config);

      if (response.data.success) {
        fetchCategories();
        resetForm();
      } else {
        alert(response.data.message || 'Hata oluştu');
      }
    } catch (error) {
      console.error('Kategori kaydedilemedi:', error);
      alert('Kategori kaydedilemedi');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      image_file: null,
      parent_id: category.parent_id
    });
    setImageType(category.image_url ? 'url' : 'file');
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    try {
      // Use adminApi for proper admin token authentication
      const response = await adminApi.delete(`/api/categories/${id}`);

      if (response.data.success) {
        fetchCategories();
      } else {
        alert(response.data.message || 'Kategori silinemedi');
      }
    } catch (error) {
      console.error('Kategori silinemedi:', error);
      alert('Kategori silinemedi');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      image_file: null,
      parent_id: null
    });
    setImageType('url');
    setEditingCategory(null);
    setShowAddForm(false);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[üç]/g, 'u')
      .replace(/[şç]/g, 'c')
      .replace(/[ğ]/g, 'g')
      .replace(/[ı]/g, 'i')
      .replace(/[ö]/g, 'o')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 h-64 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-mono">Kategori Yonetimi</h1>
          <p className="text-gray-400 font-mono">Urun kategorilerini ve siniflandirmalarini yonet</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-900 hover:bg-red-800 text-red-200 px-4 py-2 rounded-lg transition-colors border border-red-700 font-mono"
        >
          [ADD] New Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-black border border-red-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-400 mb-4 font-mono">
            {editingCategory ? '[EDIT] Modify Category' : '[CREATE] New Category'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  });
                }}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                placeholder="Enter category name..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                URL Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                placeholder="url-slug"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Kategori açıklaması"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Kategori Resmi
              </label>

              {/* Resim tipi seçimi */}
              <div className="flex gap-4 mb-3">
                <label className="flex items-center text-gray-300">
                  <input
                    type="radio"
                    name="imageType"
                    value="url"
                    checked={imageType === 'url'}
                    onChange={(e) => setImageType(e.target.value)}
                    className="mr-2"
                  />
                  URL Bağlantısı
                </label>
                <label className="flex items-center text-gray-300">
                  <input
                    type="radio"
                    name="imageType"
                    value="file"
                    checked={imageType === 'file'}
                    onChange={(e) => setImageType(e.target.value)}
                    className="mr-2"
                  />
                  Dosya Yükle
                </label>
              </div>

              {/* URL input */}
              {imageType === 'url' && (
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              )}

              {/* File input */}
              {imageType === 'file' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image_file: e.target.files[0]})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP formatında resim yükleyebilirsiniz (Maksimum 5MB)</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Üst Kategori
              </label>
              <select
                value={formData.parent_id || ''}
                onChange={(e) => setFormData({...formData, parent_id: e.target.value || null})}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Ana Kategori</option>
                {categories.filter(cat => !cat.parent_id).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="bg-green-900 hover:bg-green-800 text-green-200 px-6 py-2 rounded-lg transition-colors border border-green-700 font-mono"
              >
                {editingCategory ? '[SAVE] Update' : '[CREATE] Add'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded-lg transition-colors border border-gray-600 font-mono"
              >
                [CANCEL] Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-black border border-red-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-red-900">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  [CATEGORY]
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  [SLUG]
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  [PARENT]
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  [PRODUCTS]
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                  [ACTIONS]
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-red-900/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {category.image_url && (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-10 h-10 rounded-lg mr-3 object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-400">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {category.parent_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {category.product_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-green-400 hover:text-green-300 mr-4 font-mono"
                    >
                      [EDIT]
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-400 hover:text-red-300 font-mono"
                    >
                      [DELETE]
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-6 text-red-400 font-mono">[EMPTY]</div>
            <p className="text-gray-400 font-mono">No categories found in database</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;