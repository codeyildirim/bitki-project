import React, { useState, useEffect } from 'react';

const FunctionalUsers = () => {
  const [users, setUsers] = useState([]);
  const [userLogs, setUserLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchUserLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      } else {
        // Demo veriler
        setUsers([
          {
            id: 1,
            nickname: 'ali_yilmaz',
            city: 'İstanbul',
            role: 'user',
            created_at: '2024-01-15',
            last_login: '2024-09-15',
            last_ip: '192.168.1.100'
          },
          {
            id: 2,
            nickname: 'ayse_kaya',
            city: 'Ankara',
            role: 'user',
            created_at: '2024-02-10',
            last_login: '2024-09-14',
            last_ip: '10.0.0.50'
          },
          {
            id: 3,
            nickname: 'mehmet_demir',
            city: 'İzmir',
            role: 'user',
            created_at: '2024-03-05',
            last_login: '2024-09-13',
            last_ip: '172.16.0.25'
          }
        ]);
      }
    } catch (error) {
      console.error('Users loading failed:', error);
      setUsers([
        {
          id: 1,
          nickname: 'ali_yilmaz',
          city: 'İstanbul',
          role: 'user',
          created_at: '2024-01-15',
          last_login: '2024-09-15',
          last_ip: '192.168.1.100'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIPBans = async () => {
    try {
      const response = await fetch('/api/admin/ip-bans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIpBans(data.data || []);
      } else {
        setIpBans([
          { id: 1, ip_address: '192.168.1.100', reason: 'Spam gönderimi', created_at: '2024-09-10' },
          { id: 2, ip_address: '10.0.0.0/24', reason: 'Şüpheli aktivite', created_at: '2024-09-12' }
        ]);
      }
    } catch (error) {
      setIpBans([
        { id: 1, ip_address: '192.168.1.100', reason: 'Spam gönderimi', created_at: '2024-09-10' },
        { id: 2, ip_address: '10.0.0.0/24', reason: 'Şüpheli aktivite', created_at: '2024-09-12' }
      ]);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Kullanıcı silindi!');
        fetchUsers();
      } else {
        alert('Silme hatası: ' + data.message);
      }
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('Bu kullanıcının şifresini sıfırlamak istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert(`Şifre sıfırlandı! Yeni şifre: ${data.data.newPassword}`);
      } else {
        alert('Şifre sıfırlama hatası: ' + data.message);
      }
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleAddIPBan = async (e) => {
    e.preventDefault();
    if (!newBanIP.trim()) return;

    try {
      const response = await fetch('/api/admin/ip-bans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ip_address: newBanIP,
          reason: 'Admin tarafından eklendi'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('IP ban eklendi!');
        setNewBanIP('');
        fetchIPBans();
      } else {
        alert('IP ban ekleme hatası: ' + data.message);
      }
    } catch (error) {
      console.error('IP ban ekleme hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleRemoveIPBan = async (banId) => {
    if (!confirm('Bu IP ban\'ını kaldırmak istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/ip-bans/${banId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('IP ban kaldırıldı!');
        fetchIPBans();
      } else {
        alert('IP ban kaldırma hatası: ' + data.message);
      }
    } catch (error) {
      console.error('IP ban kaldırma hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">[USER] Kullanıcı Yönetimi</h1>
        <p className="text-gray-600">Kullanıcıları ve güvenlik ayarlarını yönetin</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Kullanıcılar ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('ip-bans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ip-bans'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            IP Banları ({ipBans.length})
          </button>
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Şehir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Giriş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-medium">
                              {user.nickname.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{user.nickname}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.city}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString('tr-TR') : 'Hiç'}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Şifre Sıfırla
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">[USER]</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Henüz kullanıcı yok</h3>
              <p className="text-gray-500">Kullanıcılar kayıt olduklarında burada görünecekler</p>
            </div>
          )}
        </div>
      )}

      {/* IP Bans Tab */}
      {activeTab === 'ip-bans' && (
        <div className="space-y-6">
          {/* Add IP Ban Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">IP Ban Ekle</h2>
            <form onSubmit={handleAddIPBan} className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={newBanIP}
                  onChange={(e) => setNewBanIP(e.target.value)}
                  placeholder="IP adresi veya CIDR (örn: 192.168.1.100 veya 10.0.0.0/24)"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Ban Ekle
              </button>
            </form>
          </div>

          {/* IP Bans Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Adresi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sebep
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ban Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ipBans.map((ban) => (
                    <tr key={ban.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {ban.ip_address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {ban.reason}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(ban.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleRemoveIPBan(ban.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Kaldır
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {ipBans.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">[BLOCKED]</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">IP ban'ı yok</h3>
                <p className="text-gray-500">Şüpheli IP adreslerini buradan banlay abilirsiniz</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionalUsers;