import React, { useState, useEffect } from 'react';
import { Upload, Video, Trash2, CheckCircle, XCircle, Info } from 'lucide-react';

const MediaManagement = () => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchCurrentVideo();
  }, []);

  const fetchCurrentVideo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/media/background-video', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentVideo(data.data);
      }
    } catch (error) {
      console.error('Video bilgisi alınırken hata:', error);
      setMessage({ type: 'error', text: 'Video bilgisi alınamadı' });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;

    // Dosya türü kontrolü
    if (!file.type.startsWith('video/')) {
      setMessage({ type: 'error', text: 'Lütfen sadece video dosyası seçin' });
      return;
    }

    // Dosya boyutu kontrolü (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Video dosyası 50MB\'dan küçük olmalıdır' });
      return;
    }

    // MP4 format kontrolü
    if (!file.name.toLowerCase().endsWith('.mp4')) {
      setMessage({ type: 'error', text: 'Sadece .mp4 formatında video yükleyebilirsiniz' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('video', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/media/background-video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Video başarıyla yüklendi!' });
        await fetchCurrentVideo();

        // Sayfayı yenile (video önizlemesini güncellemek için)
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Video yükleme başarısız' });
      }
    } catch (error) {
      console.error('Video yükleme hatası:', error);
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu' });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleVideoUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-red-900 pb-4">
        <h1 className="text-2xl font-bold text-red-400 font-mono flex items-center space-x-2">
          <Video className="w-8 h-8" />
          <span>MEDYA YONETIMI</span>
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Arka plan video dosyasını yönetin ve güncelleyin
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

      {/* Current Video Info */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-400" />
          <span>Mevcut Video</span>
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">Video bilgisi yükleniyor...</p>
          </div>
        ) : currentVideo && currentVideo.exists ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Dosya Yolu:</label>
                <p className="text-white font-mono">{currentVideo.path}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Dosya Boyutu:</label>
                <p className="text-white">{formatFileSize(currentVideo.size)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Son Güncelleme:</label>
                <p className="text-white">{new Date(currentVideo.lastModified).toLocaleString('tr-TR')}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Durum:</label>
                <span className="text-green-400 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Aktif</span>
                </span>
              </div>
            </div>

            {/* Video Preview */}
            <div className="mt-6">
              <label className="text-sm text-gray-400 block mb-2">Video Önizleme:</label>
              <video
                src={currentVideo.path + '?t=' + Date.now()}
                controls
                className="max-w-md rounded-lg border border-gray-600"
                style={{ maxHeight: '200px' }}
              >
                Tarayıcınız video oynatmayı desteklemiyor.
              </video>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Henüz arka plan videosu yüklenmemiş</p>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Upload className="w-5 h-5 text-green-400" />
          <span>Yeni Video Yükle</span>
        </h2>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-green-400 bg-green-900/20'
              : uploading
                ? 'border-yellow-400 bg-yellow-900/20'
                : 'border-gray-600 hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="text-yellow-400 font-medium">Video yükleniyor...</p>
              <p className="text-gray-400 text-sm">Lütfen bekleyin, bu işlem birkaç dakika sürebilir</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-16 h-16 text-gray-400 mx-auto" />
              <div>
                <p className="text-white font-medium mb-2">
                  Video dosyasını buraya sürükleyin veya seçin
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Sadece .mp4 formatı • Maksimum 50MB
                </p>
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={(e) => e.target.files[0] && handleVideoUpload(e.target.files[0])}
                  className="hidden"
                  id="video-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="video-upload"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                >
                  Dosya Seç
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Upload Instructions */}
        <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-600">
          <h3 className="text-sm font-semibold text-yellow-400 mb-2">ÖNEMLİ BİLGİLER:</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Video dosyası .mp4 formatında olmalıdır</li>
            <li>• Maksimum dosya boyutu 50MB'dır</li>
            <li>• Yüklenen video mevcut arka plan videosunun yerini alacaktır</li>
            <li>• Video yüklendikten sonra sayfa otomatik yenilenecektir</li>
            <li>• En iyi sonuç için 1920x1080 çözünürlükte video kullanın</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MediaManagement;