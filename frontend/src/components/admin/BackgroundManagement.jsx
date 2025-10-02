import React, { useState, useEffect } from 'react';
import { Upload, Image, Video, Trash2, CheckCircle, XCircle, Monitor, Smartphone, Eye } from 'lucide-react';

const BackgroundManagement = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [backgrounds, setBackgrounds] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);
  const [previewModal, setPreviewModal] = useState({ show: false, url: '', type: '' });

  const pages = [
    { id: 'home', name: 'Ana Sayfa', icon: '🏠' },
    { id: 'products', name: 'Ürünler', icon: '🛍️' },
    { id: 'blog', name: 'Blog', icon: '📝' }
  ];

  useEffect(() => {
    fetchBackgrounds();
  }, [activeTab]);

  const fetchBackgrounds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/backgrounds/page/${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBackgrounds(data.data);
      }
    } catch (error) {
      console.error('Arka planlar yüklenemedi:', error);
      setMessage({ type: 'error', text: 'Arka planlar yüklenemedi' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file, deviceType) => {
    if (!file) return;

    const fileExt = file.name.split('.').pop().toLowerCase();
    const isVideo = fileExt === 'mp4';
    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt);

    if (!isVideo && !isImage) {
      setMessage({ type: 'error', text: 'Desteklenmeyen dosya formatı' });
      return;
    }

    // Dosya boyutu kontrolü (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Dosya boyutu 100MB\'dan küçük olmalıdır' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('background', file);
      formData.append('page', activeTab);
      formData.append('deviceType', deviceType);
      formData.append('fileType', isVideo ? 'video' : 'image');

      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl('/api/backgrounds/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: `${deviceType === 'mobile' ? 'Mobil' : 'Masaüstü'} arka plan başarıyla yüklendi` });
        await fetchBackgrounds();
      } else {
        setMessage({ type: 'error', text: data.message || 'Yükleme başarısız' });
      }
    } catch (error) {
      console.error('Yükleme hatası:', error);
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (deviceType, fileType) => {
    if (!confirm(`${deviceType === 'mobile' ? 'Mobil' : 'Masaüstü'} ${fileType === 'video' ? 'video' : 'resim'} arka planını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl('/api/backgrounds/delete'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page: activeTab,
          deviceType,
          fileType
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Arka plan silindi' });
        await fetchBackgrounds();
      } else {
        setMessage({ type: 'error', text: data.message || 'Silme başarısız' });
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu' });
    }
  };

  const BackgroundCard = ({ deviceType, deviceName, icon }) => {
    const deviceBg = backgrounds[deviceType] || { video: null, image: null };
    const currentBg = deviceBg.video || deviceBg.image;

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          {icon}
          <span>{deviceName}</span>
        </h3>

        {/* Mevcut Arka Plan Önizleme */}
        {currentBg && (
          <div className="mb-4">
            <label className="text-sm text-gray-400 block mb-2">Mevcut Arka Plan:</label>
            <div className="relative group">
              {deviceBg.video ? (
                <div className="relative">
                  <video
                    src={deviceBg.video + '?t=' + Date.now()}
                    className="w-full h-32 object-cover rounded-lg border border-gray-600"
                    muted
                    loop
                    autoPlay
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={deviceBg.image + '?t=' + Date.now()}
                  alt="Background"
                  className="w-full h-32 object-cover rounded-lg border border-gray-600"
                />
              )}

              {/* Önizleme ve Silme Butonları */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 rounded-lg">
                <button
                  onClick={() => setPreviewModal({
                    show: true,
                    url: currentBg,
                    type: deviceBg.video ? 'video' : 'image'
                  })}
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  title="Önizle"
                >
                  <Eye className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(deviceType, deviceBg.video ? 'video' : 'image')}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Yükleme Alanları */}
        <div className="space-y-3">
          {/* Video Yükleme */}
          <div>
            <label className="text-sm text-gray-400 flex items-center space-x-1 mb-1">
              <Video className="w-4 h-4" />
              <span>Video Yükle (.mp4)</span>
            </label>
            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0], deviceType)}
              className="hidden"
              id={`video-${deviceType}`}
              disabled={uploading}
            />
            <label
              htmlFor={`video-${deviceType}`}
              className={`block w-full p-2 text-center border-2 border-dashed border-gray-600 hover:border-green-500 rounded-lg cursor-pointer transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {deviceBg.video ? 'Video Değiştir' : 'Video Seç'}
            </label>
          </div>

          {/* Resim Yükleme */}
          <div>
            <label className="text-sm text-gray-400 flex items-center space-x-1 mb-1">
              <Image className="w-4 h-4" />
              <span>Resim Yükle (.jpg, .png, .webp)</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0], deviceType)}
              className="hidden"
              id={`image-${deviceType}`}
              disabled={uploading}
            />
            <label
              htmlFor={`image-${deviceType}`}
              className={`block w-full p-2 text-center border-2 border-dashed border-gray-600 hover:border-green-500 rounded-lg cursor-pointer transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {deviceBg.image ? 'Resim Değiştir' : 'Resim Seç'}
            </label>
          </div>
        </div>

        {/* Durum Bilgisi */}
        {!currentBg && (
          <div className="mt-4 p-3 bg-gray-900 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Henüz arka plan yüklenmemiş</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-red-900 pb-4">
        <h1 className="text-2xl font-bold text-red-400 font-mono flex items-center space-x-2">
          <Image className="w-8 h-8" />
          <span>ARKA PLAN YONETIMI</span>
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Her sayfa için ayrı mobil ve masaüstü arka planları yönetin
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg border flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-green-900 border-green-700 text-green-200'
            : 'bg-red-900 border-red-700 text-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-700">
        {pages.map(page => (
          <button
            key={page.id}
            onClick={() => setActiveTab(page.id)}
            className={`px-4 py-2 font-mono transition-colors ${
              activeTab === page.id
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="mr-2">{page.icon}</span>
            {page.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BackgroundCard
            deviceType="mobile"
            deviceName="Mobil Görünüm"
            icon={<Smartphone className="w-5 h-5 text-blue-400" />}
          />
          <BackgroundCard
            deviceType="desktop"
            deviceName="Masaüstü Görünüm"
            icon={<Monitor className="w-5 h-5 text-green-400" />}
          />
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
        <h3 className="text-sm font-semibold text-yellow-400 mb-2">KULLANIM BİLGİLERİ:</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Video dosyaları .mp4 formatında olmalıdır</li>
          <li>• Resim dosyaları .jpg, .png veya .webp formatında olmalıdır</li>
          <li>• Maksimum dosya boyutu 100MB'dır</li>
          <li>• Öncelik sırası: Video {'>'} Resim {'>'} Varsayılan</li>
          <li>• Mobil: Ekran genişliği {'<'} 768px için gösterilir</li>
          <li>• Masaüstü: Ekran genişliği ≥ 768px için gösterilir</li>
          <li>• Yüklenen dosyalar otomatik olarak önceki versiyonun üzerine yazılır</li>
        </ul>
      </div>

      {/* Preview Modal */}
      {previewModal.show && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewModal({ show: false, url: '', type: '' })}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewModal({ show: false, url: '', type: '' })}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <XCircle className="w-8 h-8" />
            </button>
            {previewModal.type === 'video' ? (
              <video
                src={previewModal.url}
                controls
                className="w-full rounded-lg"
                autoPlay
              />
            ) : (
              <img
                src={previewModal.url}
                alt="Preview"
                className="w-full rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundManagement;