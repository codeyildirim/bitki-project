import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Eye, Image, Film, Monitor, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const BackgroundSettings = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [backgrounds, setBackgrounds] = useState({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const pages = [
    { key: 'home', label: 'Ana Sayfa', icon: '🏠' },
    { key: 'products', label: 'Ürünler', icon: '📦' },
    { key: 'blog', label: 'Blog', icon: '📝' }
  ];

  // Mevcut arka planları getir
  const fetchBackgrounds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl('/api/admin/background/list'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBackgrounds(data.data);
      } else {
        toast.error('Arka planlar yüklenemedi');
      }
    } catch (error) {
      console.error('Arka plan listesi hatası:', error);
      toast.error('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  // Dosya yükleme
  const handleUpload = async (page, type, format, file) => {
    if (!file) {
      toast.error('Dosya seçilmedi');
      return;
    }

    console.log('Upload başlatılıyor:', { page, type, format, file: file.name });

    // Dosya boyutu kontrolü
    const maxSize = type === 'mobile' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Dosya çok büyük. Maksimum: ${type === 'mobile' ? '10MB' : '50MB'}`);
      return;
    }

    // Format kontrolü
    if (format === 'video' && !file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
      toast.error('Video dosyası MP4 formatında olmalıdır');
      return;
    }

    if (format === 'image' && !file.type.startsWith('image/')) {
      toast.error('Resim dosyası JPG, PNG veya WebP formatında olmalıdır');
      return;
    }

    setUploading(true);

    try {
      // FormData oluştur
      const formData = new FormData();
      formData.append('file', file);
      formData.append('page', page);
      formData.append('type', type);
      formData.append('format', format);

      console.log('FormData hazırlandı:', {
        page,
        type,
        format,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const token = localStorage.getItem('token');

      const response = await fetch(createApiUrl('/api/admin/background/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type header'ını EKLEME - FormData otomatik olarak ekler
        },
        body: formData
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        toast.success(data.message || 'Arka plan başarıyla yüklendi');
        // Cache-bust için yeniden yükle
        await fetchBackgrounds();
        // Bildirim gösterdikten sonra yenile
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(data.message || `Upload başarısız (${response.status})`);
      }
    } catch (error) {
      console.error('Upload hatası:', error);
      toast.error('Yükleme sırasında bağlantı hatası oluştu');
    } finally {
      setUploading(false);
    }
  };

  // Dosya silme
  const handleDelete = async (page, type, format) => {
    if (!window.confirm('Bu arka planı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl('/api/admin/background/delete'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page, type, format })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Arka plan silindi');
        await fetchBackgrounds();
      } else {
        toast.error(data.message || 'Silme başarısız');
      }
    } catch (error) {
      console.error('Delete hatası:', error);
      toast.error('Silme sırasında hata oluştu');
    }
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Önizleme URL'i oluştur
  const getPreviewUrl = (path) => {
    return path ? `${path}?v=${Date.now()}` : null;
  };

  // Tek cihaz için upload/preview bileşeni
  const DeviceUploader = ({ page, deviceType, deviceIcon, deviceLabel }) => {
    const deviceData = backgrounds[page]?.[deviceType] || {};
    const hasVideo = deviceData.video;
    const hasImage = deviceData.image;

    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {deviceIcon}
            <h4 className="text-lg font-semibold text-white">{deviceLabel}</h4>
          </div>
        </div>

        {/* Video Yükleme */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400 flex items-center gap-1">
              <Film size={16} />
              Video (MP4)
            </label>
            {hasVideo && (
              <button
                onClick={() => handleDelete(page, deviceType, 'video')}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {hasVideo ? (
            <div className="bg-gray-700 rounded p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  <p>{hasVideo.filename}</p>
                  <p>{formatFileSize(hasVideo.size)}</p>
                </div>
                <a
                  href={getPreviewUrl(hasVideo.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Eye size={16} />
                </a>
              </div>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="video/mp4"
                className="hidden"
                onChange={(e) => handleUpload(page, deviceType, 'video', e.target.files[0])}
                disabled={uploading}
              />
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors">
                <Upload size={20} className="mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">Video yükle</p>
                <p className="text-xs text-gray-600 mt-1">Maks: {deviceType === 'mobile' ? '10MB' : '50MB'}</p>
              </div>
            </label>
          )}
        </div>

        {/* Resim Yükleme */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400 flex items-center gap-1">
              <Image size={16} />
              Resim (JPG/PNG/WebP)
            </label>
            {hasImage && (
              <button
                onClick={() => handleDelete(page, deviceType, 'image')}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {hasImage ? (
            <div className="bg-gray-700 rounded p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  <p>{hasImage.filename}</p>
                  <p>{formatFileSize(hasImage.size)}</p>
                </div>
                <a
                  href={getPreviewUrl(hasImage.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Eye size={16} />
                </a>
              </div>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleUpload(page, deviceType, 'image', e.target.files[0])}
                disabled={uploading}
              />
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors">
                <Upload size={20} className="mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">Resim yükle</p>
                <p className="text-xs text-gray-600 mt-1">Maks: {deviceType === 'mobile' ? '10MB' : '50MB'}</p>
              </div>
            </label>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Arka Plan Yönetimi</h2>
        <p className="text-gray-400">Sayfalara özel video ve resim arka planları yükleyin</p>
      </div>

      {/* Sekme Seçici */}
      <div className="flex gap-2 border-b border-gray-700">
        {pages.map(page => (
          <button
            key={page.key}
            onClick={() => setActiveTab(page.key)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === page.key
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className="mr-2">{page.icon}</span>
            {page.label}
          </button>
        ))}
      </div>

      {/* İçerik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mobil */}
        <DeviceUploader
          page={activeTab}
          deviceType="mobile"
          deviceIcon={<Smartphone size={20} className="text-gray-400" />}
          deviceLabel="Mobil"
        />

        {/* Desktop */}
        <DeviceUploader
          page={activeTab}
          deviceType="desktop"
          deviceIcon={<Monitor size={20} className="text-gray-400" />}
          deviceLabel="Masaüstü"
        />
      </div>

      {/* Bilgi */}
      <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 border border-blue-700">
        <h4 className="text-blue-400 font-semibold mb-2">📌 Önemli Notlar</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Video formatı sadece MP4 olmalıdır</li>
          <li>• Resim formatları: JPG, PNG, WebP</li>
          <li>• Mobil için maksimum dosya boyutu: 10MB</li>
          <li>• Desktop için maksimum dosya boyutu: 50MB</li>
          <li>• Video yoksa otomatik olarak resim gösterilir</li>
          <li>• Her ikisi de yoksa sayfa şeffaf kalır</li>
          <li>• Safari'de autoplay için videolar sessize alınmıştır</li>
        </ul>
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="text-white">Yükleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundSettings;