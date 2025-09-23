import React, { useState, useEffect } from 'react';

const AdminUsers = () => {
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
      // localStorage'dan kullanıcıları al
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');

      // Kullanıcıları admin paneli formatına çevir
      const formattedUsers = localUsers.map(user => ({
        id: user.id,
        nickname: user.nickname,
        city: user.city,
        created_at: user.createdAt || new Date().toISOString(),
        last_login: user.lastLogin || user.createdAt || new Date().toISOString(),
        status: 'active',
        user_type: 'normal'
      }));

      setUsers(formattedUsers);
      console.log('📊 LocalStorage\'dan kullanıcılar yüklendi:', formattedUsers.length);
    } catch (error) {
      console.error('Users loading failed:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLogs = async () => {
    try {
      // localStorage tabanlı log sistemi - şimdilik boş array
      const userLogs = JSON.parse(localStorage.getItem('userLogs') || '[]');
      setUserLogs(userLogs);
      console.log('📊 LocalStorage\'dan kullanıcı logları yüklendi:', userLogs.length);
    } catch (error) {
      console.error('User logs loading failed:', error);
      setUserLogs([]);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      // localStorage tabanlı log sistemi - şimdilik boş array
      const systemLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
      setSystemLogs(systemLogs);
      console.log('📊 LocalStorage\'dan sistem logları yüklendi:', systemLogs.length);
    } catch (error) {
      console.error('System logs loading failed:', error);
      setSystemLogs([]);
    }
  };

  const handleViewUserLogs = (user) => {
    setSelectedUser(user);
    setActiveTab('user-logs');
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
      <div>
        <h1 className="text-3xl font-bold text-white font-mono">Kullanıcı Yönetimi</h1>
        <p className="text-gray-400 font-mono">Kullanıcıları yönet ve aktivitelerini izle</p>
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
                        <button
                          onClick={() => handleViewUserLogs(user)}
                          className="text-red-400 hover:text-red-300 font-mono"
                        >
                          Logları Görüntüle
                        </button>
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