import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('coupons');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    validFrom: '',
    validUntil: ''
  });

  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    description: '',
    campaignType: 'discount',
    discountPercentage: '',
    minItems: '',
    requiredCategoryId: '',
    validFrom: '',
    validUntil: ''
  });

  useEffect(() => {
    fetchCoupons();
    fetchCampaigns();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('/api/coupons', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (error) {
      console.error('Kuponlar yüklenemedi:', error);
      toast.error('Kuponlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/coupons/campaigns', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setCampaigns(response.data.data);
      }
    } catch (error) {
      console.error('Kampanyalar yüklenemedi:', error);
    }
  };

  const handleSubmitCoupon = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = editingItem
        ? `/api/coupons/${editingItem.id}`
        : '/api/coupons';

      const method = editingItem ? 'put' : 'post';

      const response = await axios[method](endpoint, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        toast.success(editingItem ? 'Kupon güncellendi' : 'Kupon oluşturuldu');
        fetchCoupons();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCampaign = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = editingItem
        ? `/api/coupons/campaigns/${editingItem.id}`
        : '/api/coupons/campaigns';

      const method = editingItem ? 'put' : 'post';

      const response = await axios[method](endpoint, campaignFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        toast.success(editingItem ? 'Kampanya güncellendi' : 'Kampanya oluşturuldu');
        fetchCampaigns();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type = 'coupon') => {
    if (!window.confirm('Silmek istediğinizden emin misiniz?')) return;

    try {
      const endpoint = type === 'coupon'
        ? `/api/coupons/${id}`
        : `/api/coupons/campaigns/${id}`;

      const response = await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        toast.success('Başarıyla silindi');
        type === 'coupon' ? fetchCoupons() : fetchCampaigns();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Silme başarısız');
    }
  };

  const toggleStatus = async (item, type = 'coupon') => {
    try {
      const endpoint = type === 'coupon'
        ? `/api/coupons/${item.id}`
        : `/api/coupons/campaigns/${item.id}`;

      const response = await axios.put(endpoint,
        { isActive: !item.is_active },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );

      if (response.data.success) {
        toast.success('Durum güncellendi');
        type === 'coupon' ? fetchCoupons() : fetchCampaigns();
      }
    } catch (error) {
      toast.error('Durum güncellenemedi');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchaseAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      validFrom: '',
      validUntil: ''
    });
    setCampaignFormData({
      name: '',
      description: '',
      campaignType: 'discount',
      discountPercentage: '',
      minItems: '',
      requiredCategoryId: '',
      validFrom: '',
      validUntil: ''
    });
    setEditingItem(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Süresiz';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const getCampaignTypeLabel = (type) => {
    const types = {
      discount: 'İndirim',
      free_shipping: 'Ücretsiz Kargo',
      buy_x_get_y: 'Al Kazan',
      bundle: 'Paket'
    };
    return types[type] || type;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Kupon ve Kampanya Yönetimi
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus size={20} />
          Yeni {activeTab === 'coupons' ? 'Kupon' : 'Kampanya'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'coupons'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Tag size={20} />
              Kuponlar
            </div>
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campaigns'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Percent size={20} />
              Kampanyalar
            </div>
          </button>
        </nav>
      </div>

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Kod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  İndirim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Kullanım
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Geçerlilik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="mr-2 text-gray-400" size={16} />
                      <span className="font-mono font-bold">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{coupon.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {coupon.discount_type === 'percentage' ? (
                        <>
                          <Percent size={16} className="mr-1 text-green-600" />
                          <span>%{coupon.discount_value}</span>
                        </>
                      ) : (
                        <>
                          <DollarSign size={16} className="mr-1 text-green-600" />
                          <span>{coupon.discount_value} TL</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coupon.total_usage || 0} / {coupon.usage_limit || '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_until)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(coupon, 'coupon')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        coupon.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {coupon.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(coupon);
                          setFormData({
                            code: coupon.code,
                            description: coupon.description,
                            discountType: coupon.discount_type,
                            discountValue: coupon.discount_value,
                            minPurchaseAmount: coupon.min_purchase_amount,
                            maxDiscountAmount: coupon.max_discount_amount,
                            usageLimit: coupon.usage_limit,
                            validFrom: coupon.valid_from,
                            validUntil: coupon.valid_until
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={18} />
                      </button>
                      {!coupon.total_usage && (
                        <button
                          onClick={() => handleDelete(coupon.id, 'coupon')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Kampanya Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  İndirim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Geçerlilik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {getCampaignTypeLabel(campaign.campaign_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {campaign.discount_percentage && `%${campaign.discount_percentage}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(campaign.valid_from)} - {formatDate(campaign.valid_until)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(campaign, 'campaign')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {campaign.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(campaign);
                          setCampaignFormData({
                            name: campaign.name,
                            description: campaign.description,
                            campaignType: campaign.campaign_type,
                            discountPercentage: campaign.discount_percentage,
                            minItems: campaign.min_items,
                            requiredCategoryId: campaign.required_category_id,
                            validFrom: campaign.valid_from,
                            validUntil: campaign.valid_until
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Düzenle' : 'Yeni Ekle'}: {activeTab === 'coupons' ? 'Kupon' : 'Kampanya'}
            </h2>

            {activeTab === 'coupons' ? (
              <form onSubmit={handleSubmitCoupon} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kupon Kodu</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows="2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">İndirim Tipi</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="percentage">Yüzde</option>
                      <option value="fixed">Sabit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">İndirim Değeri</label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min. Tutar</label>
                    <input
                      type="number"
                      value={formData.minPurchaseAmount}
                      onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Kullanım Limiti</label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Başlangıç</label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bitiş</label>
                    <input
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
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
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    İptal
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kampanya Adı</label>
                  <input
                    type="text"
                    value={campaignFormData.name}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Açıklama</label>
                  <textarea
                    value={campaignFormData.description}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Kampanya Tipi</label>
                  <select
                    value={campaignFormData.campaignType}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, campaignType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="discount">İndirim</option>
                    <option value="free_shipping">Ücretsiz Kargo</option>
                    <option value="buy_x_get_y">Al Kazan</option>
                    <option value="bundle">Paket</option>
                  </select>
                </div>

                {campaignFormData.campaignType === 'discount' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">İndirim Yüzdesi</label>
                    <input
                      type="number"
                      value={campaignFormData.discountPercentage}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, discountPercentage: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Başlangıç</label>
                    <input
                      type="datetime-local"
                      value={campaignFormData.validFrom}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, validFrom: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bitiş</label>
                    <input
                      type="datetime-local"
                      value={campaignFormData.validUntil}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, validUntil: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
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
                      resetForm();
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

export default AdminCoupons;