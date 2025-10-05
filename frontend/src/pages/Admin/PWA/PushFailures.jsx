import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Clock, XCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../../context/AdminAuthContext.jsx';

const PushFailures = () => {
  const { adminApi } = useAdminAuth();
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFailures();
  }, []);

  const fetchFailures = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/api/pwa/failures');

      if (response.data.success) {
        setFailures(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Veriler yüklenemedi');
      }
    } catch (error) {
      console.error('Push failures yükleme hatası:', error);
      toast.error('Veriler yüklenemedi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getErrorBadgeColor = (errorCode) => {
    if (!errorCode) return 'bg-gray-500';
    if (errorCode === 410) return 'bg-red-600'; // Gone
    if (errorCode === 404) return 'bg-orange-600'; // Not Found
    if (errorCode === 429) return 'bg-yellow-600'; // Rate Limit
    if (errorCode === 503) return 'bg-purple-600'; // Unavailable
    return 'bg-red-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateEndpoint = (endpoint) => {
    if (!endpoint) return 'N/A';
    if (endpoint.length <= 50) return endpoint;
    return endpoint.substring(0, 47) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-green-500 mx-auto mb-4" size={48} />
          <p className="text-white font-mono text-xl">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-red-900 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-mono flex items-center gap-2">
            📬 Bildirim Gönderim Logları
          </h1>
          <p className="text-gray-400 font-mono mt-2">
            Başarısız push bildirim denemeleri ve hata detayları
          </p>
        </div>
        <button
          onClick={fetchFailures}
          className="bg-green-900 text-green-200 px-4 py-2 rounded hover:bg-green-800 transition-colors font-mono border border-green-700 flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Yenile
        </button>
      </div>

      {/* Empty State */}
      {failures.length === 0 ? (
        <div className="bg-green-900/20 border-2 border-green-700 rounded-lg p-12 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-green-400 font-mono mb-2">
            Tüm bildirimler başarıyla teslim edildi! 🎉
          </h2>
          <p className="text-gray-400 font-mono">
            Henüz hiçbir bildirim gönderim hatası kaydedilmedi.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-red-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-mono">Toplam Hata</p>
                  <p className="text-2xl font-bold text-red-400 font-mono">{failures.length}</p>
                </div>
                <XCircle className="text-red-500" size={32} />
              </div>
            </div>

            <div className="bg-gray-900 border border-orange-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-mono">410 Gone</p>
                  <p className="text-2xl font-bold text-orange-400 font-mono">
                    {failures.filter(f => f.error_code === 410).length}
                  </p>
                </div>
                <AlertCircle className="text-orange-500" size={32} />
              </div>
            </div>

            <div className="bg-gray-900 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-mono">Diğer Hatalar</p>
                  <p className="text-2xl font-bold text-yellow-400 font-mono">
                    {failures.filter(f => f.error_code !== 410).length}
                  </p>
                </div>
                <AlertCircle className="text-yellow-500" size={32} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-black border border-red-900 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-red-900/30">
                  <tr className="border-b border-red-900">
                    <th className="text-left p-3 text-red-300 font-mono">ID</th>
                    <th className="text-left p-3 text-red-300 font-mono">Endpoint</th>
                    <th className="text-left p-3 text-red-300 font-mono">Hata Kodu</th>
                    <th className="text-left p-3 text-red-300 font-mono">Hata Mesajı</th>
                    <th className="text-left p-3 text-red-300 font-mono">Bildirim</th>
                    <th className="text-left p-3 text-red-300 font-mono">Retry</th>
                    <th className="text-left p-3 text-red-300 font-mono">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {failures.map((failure) => (
                    <tr key={failure.id} className="border-b border-gray-800 hover:bg-gray-900">
                      <td className="p-3 text-gray-300 font-mono">#{failure.id}</td>
                      <td className="p-3 text-gray-400 font-mono text-xs">
                        <span title={failure.endpoint}>
                          {truncateEndpoint(failure.endpoint)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getErrorBadgeColor(failure.error_code)}`}>
                          {failure.error_code || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300 font-mono text-sm">
                        {failure.error_message || 'Unknown error'}
                      </td>
                      <td className="p-3 text-gray-400 font-mono text-sm">
                        {failure.notification_title ? (
                          <div>
                            <div className="text-white">{failure.notification_title}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {failure.notification_body}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-300 font-mono">
                        <span className="flex items-center gap-1">
                          <RefreshCw size={14} />
                          {failure.retry_count || 0}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400 font-mono text-xs">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDate(failure.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Footer */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-400 flex-shrink-0 mt-1" size={20} />
              <div className="text-sm text-blue-300 font-mono">
                <p className="font-bold mb-1">Hata Kodları:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li><span className="text-red-400">410 Gone:</span> Abonelik süresi dolmuş (otomatik deaktive edildi)</li>
                  <li><span className="text-orange-400">404 Not Found:</span> Endpoint bulunamadı</li>
                  <li><span className="text-yellow-400">429 Rate Limit:</span> Çok fazla istek (retry edildi)</li>
                  <li><span className="text-purple-400">503 Unavailable:</span> Servis geçici olarak kullanılamıyor (retry edildi)</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PushFailures;
