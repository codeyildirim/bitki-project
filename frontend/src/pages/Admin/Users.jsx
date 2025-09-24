import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

const AdminUsers = () => {
  const { adminApi } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [userLogs, setUserLogs] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchUserLogs();
    fetchSystemLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('🔍 Admin Users: fetchUsers başlatıldı - API çağrısı yapılıyor');

      const response = await adminApi.get('/api/admin/users');
      console.log('📡 API yanıtı:', response.data);

      if (response.data.success) {
        const apiUsers = response.data.data || [];
        console.log('✅ API\'den alınan kullanıcılar:', apiUsers);
        // Admin kullanıcıları filtrele
        const normalUsers = apiUsers.filter(user => !user.is_admin);
        setUsers(normalUsers);
        console.log(`📊 Admin panele ${normalUsers.length} normal kullanıcı yüklendi`);

        // Cache temizliği - Eski localStorage kullanıcı verilerini temizle
        // Çünkü bunlar artık backend'den geliyor
        const oldUsers = localStorage.getItem('users');
        if (oldUsers) {
          console.log('🧹 Eski localStorage users verisi temizleniyor');
          localStorage.removeItem('users');
        }

      } else {
        console.error('❌ API başarısız:', response.data.message);
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ Users loading failed:', error);

      // API başarısız oldu, kullanıcı listesi boş bırakılıyor
      console.log('❌ Users: API çağrısı başarısız, kullanıcı listesi boş');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLogs = async () => {
    try {
      console.log('🔍 Admin: fetchUserLogs başlatıldı');
      const userLogsRaw = localStorage.getItem('userLogs');
      console.log('📦 Raw userLogs:', userLogsRaw);

      const userLogs = JSON.parse(userLogsRaw || '[]');
      console.log('📜 Yüklenen kullanıcı logları:', userLogs);
      setUserLogs(userLogs);
      console.log(`📊 ${userLogs.length} kullanıcı logu yüklendi`);
    } catch (error) {
      console.error('❌ User logs loading failed:', error);
      setUserLogs([]);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      console.log('🔍 Admin: fetchSystemLogs başlatıldı');
      const systemLogsRaw = localStorage.getItem('systemLogs');
      console.log('📦 Raw systemLogs:', systemLogsRaw);

      const systemLogs = JSON.parse(systemLogsRaw || '[]');
      console.log('🔧 Yüklenen sistem logları:', systemLogs);
      setSystemLogs(systemLogs);
      console.log(`📊 ${systemLogs.length} sistem logu yüklendi`);
    } catch (error) {
      console.error('❌ System logs loading failed:', error);
      setSystemLogs([]);
    }
  };

  const handleViewUserLogs = (user) => {
    setSelectedUser(user);
    setActiveTab('user-logs');
  };

  const handleDeleteUser = async (userId, userNickname) => {
    if (!confirm(`"${userNickname}" kullanıcısını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) return;

    try {
      console.log('🗑️ Kullanıcı silme başlatıldı:', { userId, userNickname });

      const response = await adminApi.delete(`/api/admin/users/${userId}`);
      console.log('📡 Silme API yanıtı:', response.data);

      if (response.data.success) {
        console.log('✅ Kullanıcı başarıyla silindi:', userNickname);

        // Kullanıcı listesini güncelle
        await fetchUsers();

        console.log('🔄 Kullanıcı listesi yenilendi');
      } else {
        console.error('❌ Silme API hatası:', response.data.message);
        alert('Silme hatası: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ Kullanıcı silme hatası:', error);
      if (error.response?.data?.message) {
        alert('Silme hatası: ' + error.response.data.message);
      } else {
        alert('Kullanıcı silinirken bir hata oluştu');
      }
    }
  };

  const handleResetPassword = async (userId, userNickname) => {
    const newPassword = prompt(`"${userNickname}" için yeni şifre girin:`);
    if (!newPassword) return;

    if (newPassword.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      console.log('🔑 Şifre sıfırlama başlatıldı:', { userId, userNickname });

      const response = await adminApi.put(`/api/admin/users/${userId}/reset-password`, {
        newPassword
      });

      if (response.data.success) {
        console.log('✅ Şifre başarıyla sıfırlandı:', userNickname);
        alert(`"${userNickname}" kullanıcısının şifresi değiştirildi`);
      } else {
        console.error('❌ Şifre sıfırlama hatası:', response.data.message);
        alert('Şifre değiştirme hatası: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ Şifre sıfırlama hatası:', error);
      if (error.response?.data?.message) {
        alert('Hata: ' + error.response.data.message);
      } else {
        alert('Şifre değiştirilirken bir hata oluştu');
      }
    }
  };



  const getLogLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return 'text-red-400';
      case 'WARNING': return 'text-red-400';
      case 'INFO': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getActionStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-400';
      case 'FAILED': return 'text-red-400';
      case 'PENDING': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white font-mono">Kullanıcı Yönetimi</h1>
          <p className="text-gray-400 font-mono">Kullanıcıları yönet ve aktivitelerini izle</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchUsers();
              fetchUserLogs();
              fetchSystemLogs();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
          >
            🔄 Verileri Yenile
          </button>
          <button
            onClick={() => {
              const users = JSON.parse(localStorage.getItem('users') || '[]');
              const userLogs = JSON.parse(localStorage.getItem('userLogs') || '[]');

              console.log('📊 Toplam Kullanıcı:', users.length);
              console.log('👥 Kullanıcılar:', users);
              console.log('📜 Son 10 Log:', userLogs.slice(0, 10));
              console.log('🔑 Current User:', localStorage.getItem('currentUser'));
              console.log('🎫 Token:', localStorage.getItem('token'));

              alert(`localStorage Durumu:\n\n` +
                    `Kullanıcı Sayısı: ${users.length}\n` +
                    `Log Sayısı: ${userLogs.length}\n` +
                    `Giriş Yapılmış: ${localStorage.getItem('token') ? 'Evet' : 'Hayır'}\n\n` +
                    `Detaylar console'da!`);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
          >
            🔍 Debug LocalStorage
          </button>
          <button
            onClick={() => {
              if (confirm('localStorage\'ı tamamen temizlemek istediğinizden emin misiniz?')) {
                localStorage.clear();
                fetchUsers();
                fetchUserLogs();
                fetchSystemLogs();
                alert('localStorage temizlendi!');
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
          >
            🗑️ LocalStorage Temizle
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-red-900">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm font-mono ${
              activeTab === 'users'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Kullanıcılar ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('user-logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm font-mono ${
              activeTab === 'user-logs'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Aktivite Logları ({userLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('system-logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm font-mono ${
              activeTab === 'system-logs'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Sistem Logları ({systemLogs.length})
          </button>
        </nav>
      </div>

      {/* Users Overview Tab */}
      {activeTab === 'users' && (
        <div className="bg-black border border-red-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Şehir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-400 font-mono">
                      Henüz kullanıcı bulunmuyor
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white font-mono">
                            {user.nickname}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            ID: {user.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                        {user.city || 'Belirtilmemiş'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                        {new Date(user.created_at).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewUserLogs(user)}
                            className="text-blue-400 hover:text-blue-300 font-mono text-xs bg-blue-900/20 px-2 py-1 rounded"
                          >
                            📋 Loglar
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.id, user.nickname)}
                            className="text-yellow-400 hover:text-yellow-300 font-mono text-xs bg-yellow-900/20 px-2 py-1 rounded"
                          >
                            🔑 Şifre
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.nickname)}
                            className="text-red-400 hover:text-red-300 font-mono text-xs bg-red-900/20 px-2 py-1 rounded"
                          >
                            🗑️ Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Activity Logs Tab */}
      {activeTab === 'user-logs' && (
        <div className="bg-black border border-red-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Zaman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    İşlem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Detay
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {userLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-400 font-mono">
                      Henüz log kaydı bulunmuyor
                    </td>
                  </tr>
                ) : (
                  userLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                        {new Date(log.created_at || log.timestamp).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                        {log.admin_nickname || log.username || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 text-xs leading-5 font-semibold font-mono ${
                          getActionStatusColor(log.status || 'INFO')
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                        {log.description || log.details || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Logs Tab */}
      {activeTab === 'system-logs' && (
        <div className="bg-black border border-red-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Zaman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Seviye
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Mesaj
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {systemLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-400 font-mono">
                      Henüz sistem logu bulunmuyor
                    </td>
                  </tr>
                ) : (
                  systemLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                        {new Date(log.created_at || log.timestamp).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 text-xs leading-5 font-semibold font-mono ${
                          getLogLevelColor(log.level || 'INFO')
                        }`}>
                          {log.level || 'INFO'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                        {log.category || log.action || 'SYSTEM'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                        {log.description || log.message || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;