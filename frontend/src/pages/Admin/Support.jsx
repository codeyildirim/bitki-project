import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, HelpCircle, MessageSquare,
  Search, Tag, TrendingUp, Eye, ChevronUp, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminSupport = () => {
  const [faqs, setFaqs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('faqs');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [faqFormData, setFaqFormData] = useState({
    category: '',
    question: '',
    answer: '',
    orderIndex: 0,
    isActive: true
  });

  const [templateFormData, setTemplateFormData] = useState({
    category: '',
    question: '',
    answer: '',
    keywords: '',
    isActive: true
  });

  // Filter states
  const [faqFilter, setFaqFilter] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');

  useEffect(() => {
    fetchFAQs();
    fetchTemplates();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get('/api/support/admin/faqs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setFaqs(response.data.data);
      }
    } catch (error) {
      console.error('FAQ\'ler yüklenemedi:', error);
      toast.error('FAQ\'ler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/support/admin/templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error('Şablonlar yüklenemedi:', error);
    }
  };

  const handleSubmitFAQ = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = editingItem
        ? `/api/support/admin/faqs/${editingItem.id}`
        : '/api/support/admin/faqs';

      const method = editingItem ? 'put' : 'post';

      const response = await axios[method](endpoint, faqFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        toast.success(editingItem ? 'FAQ güncellendi' : 'FAQ oluşturuldu');
        fetchFAQs();
        setShowModal(false);
        resetForms();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = editingItem
        ? `/api/support/admin/templates/${editingItem.id}`
        : '/api/support/admin/templates';

      const method = editingItem ? 'put' : 'post';

      const response = await axios[method](endpoint, templateFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        toast.success(editingItem ? 'Şablon güncellendi' : 'Şablon oluşturuldu');
        fetchTemplates();
        setShowModal(false);
        resetForms();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type = 'faq') => {
    if (!window.confirm('Silmek istediğinizden emin misiniz?')) return;

    try {
      const endpoint = type === 'faq'
        ? `/api/support/admin/faqs/${id}`
        : `/api/support/admin/templates/${id}`;

      const response = await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        toast.success('Başarıyla silindi');
        type === 'faq' ? fetchFAQs() : fetchTemplates();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Silme başarısız');
    }
  };

  const moveItem = async (id, direction) => {
    const currentIndex = faqs.findIndex(f => f.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= faqs.length) return;

    const newOrderIndex = faqs[newIndex].order_index;

    try {
      await axios.put(`/api/support/admin/faqs/${id}`,
        { ...faqs[currentIndex], orderIndex: newOrderIndex },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      fetchFAQs();
    } catch (error) {
      toast.error('Sıralama güncellenemedi');
    }
  };

  const resetForms = () => {
    setFaqFormData({
      category: '',
      question: '',
      answer: '',
      orderIndex: 0,
      isActive: true
    });
    setTemplateFormData({
      category: '',
      question: '',
      answer: '',
      keywords: '',
      isActive: true
    });
    setEditingItem(null);
  };

  // Filter functions
  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(faqFilter.toLowerCase()) ||
    faq.category.toLowerCase().includes(faqFilter.toLowerCase()) ||
    faq.answer.toLowerCase().includes(faqFilter.toLowerCase())
  );

  const filteredTemplates = templates.filter(template =>
    template.question.toLowerCase().includes(templateFilter.toLowerCase()) ||
    template.category.toLowerCase().includes(templateFilter.toLowerCase()) ||
    template.answer.toLowerCase().includes(templateFilter.toLowerCase()) ||
    template.keywords.toLowerCase().includes(templateFilter.toLowerCase())
  );

  // Get unique categories
  const faqCategories = [...new Set(faqs.map(f => f.category))];
  const templateCategories = [...new Set(templates.map(t => t.category))];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Destek Yönetimi
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus size={20} />
          Yeni {activeTab === 'faqs' ? 'FAQ' : 'Şablon'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'faqs'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle size={20} />
              FAQ ({faqs.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={20} />
              Şablonlar ({templates.length})
            </div>
          </button>
        </nav>
      </div>

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="FAQ ara..."
                value={faqFilter}
                onChange={(e) => setFaqFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* FAQ Cards */}
          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {faq.category}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        Sıra: {faq.order_index}
                      </span>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Eye size={14} className="mr-1" />
                        {faq.view_count || 0}
                      </div>
                      {!faq.is_active && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Pasif
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Sıralama butonları */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveItem(faq.id, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => moveItem(faq.id, 'down')}
                        disabled={index === filteredFAQs.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setEditingItem(faq);
                        setFaqFormData({
                          category: faq.category,
                          question: faq.question,
                          answer: faq.answer,
                          orderIndex: faq.order_index,
                          isActive: faq.is_active
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id, 'faq')}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Şablon ara..."
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Template Cards */}
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        {template.category}
                      </span>
                      <div className="flex items-center text-gray-500 text-xs">
                        <TrendingUp size={14} className="mr-1" />
                        {template.usage_count || 0} kullanım
                      </div>
                      {!template.is_active && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Pasif
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {template.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                      {template.answer}
                    </p>
                    {template.keywords && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Tag size={12} className="text-gray-400" />
                        {template.keywords.split(',').map((keyword, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(template);
                        setTemplateFormData({
                          category: template.category,
                          question: template.question,
                          answer: template.answer,
                          keywords: template.keywords,
                          isActive: template.is_active
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id, 'template')}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Düzenle' : 'Yeni Ekle'}: {activeTab === 'faqs' ? 'FAQ' : 'Şablon'}
            </h2>

            {activeTab === 'faqs' ? (
              <form onSubmit={handleSubmitFAQ} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <input
                      type="text"
                      value={faqFormData.category}
                      onChange={(e) => setFaqFormData({ ...faqFormData, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      list="faq-categories"
                      required
                    />
                    <datalist id="faq-categories">
                      {faqCategories.map((cat, i) => (
                        <option key={i} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Sıra</label>
                    <input
                      type="number"
                      value={faqFormData.orderIndex}
                      onChange={(e) => setFaqFormData({ ...faqFormData, orderIndex: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Soru</label>
                  <input
                    type="text"
                    value={faqFormData.question}
                    onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cevap</label>
                  <textarea
                    value={faqFormData.answer}
                    onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows="4"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="faq-active"
                    checked={faqFormData.isActive}
                    onChange={(e) => setFaqFormData({ ...faqFormData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="faq-active" className="text-sm">Aktif</label>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForms();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitTemplate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <input
                    type="text"
                    value={templateFormData.category}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    list="template-categories"
                    required
                  />
                  <datalist id="template-categories">
                    {templateCategories.map((cat, i) => (
                      <option key={i} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Soru/Konu</label>
                  <input
                    type="text"
                    value={templateFormData.question}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, question: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Hazır Cevap</label>
                  <textarea
                    value={templateFormData.answer}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, answer: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Anahtar Kelimeler (virgülle ayrılmış)</label>
                  <input
                    type="text"
                    value={templateFormData.keywords}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, keywords: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="örnek: merhaba,selam,hello"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="template-active"
                    checked={templateFormData.isActive}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="template-active" className="text-sm">Aktif</label>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForms();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;