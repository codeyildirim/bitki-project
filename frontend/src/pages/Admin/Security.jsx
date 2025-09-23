import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

const Security = () => {
  const { adminApi } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [ipBans, setIpBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [newBanIP, setNewBanIP] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchIPBans();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.get('/api/admin/users');
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIPBans = async () => {
    try {
      const response = await adminApi.get('/api/admin/ip-bans');
      if (response.data.success) {
        setIpBans(response.data.data || []);
      }
    } catch (error) {
      console.error('IP banları yüklenemedi:', error);
      setIpBans([]);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('[CONFIRM] Delete this user account? This action cannot be undone.')) return;

    try {
      const response = await adminApi.delete(`/api/admin/users/${userId}`);
      if (response.data.success) {
        alert('[SUCCESS] User account deleted');
        fetchUsers();
      } else {
        alert('[ERROR] User deletion failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('User deletion error:', error);
      alert('[ERROR] System error occurred');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('[CONFIRM] Reset user password? New password will be generated.')) return;

    try {
      const response = await adminApi.put(`/api/admin/users/${userId}/reset-password`);
      if (response.data.success) {
        alert(`[SUCCESS] Password reset completed\n\nNew Password: ${response.data.data.newPassword}\n\nProvide this to the user securely.`);
      } else {
        alert('[ERROR] Password reset failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      alert('[ERROR] System error occurred');
    }
  };

  const handleBanUserIP = async (userIP) => {
    if (!userIP) {
      alert('[ERROR] No IP address found for this user');
      return;
    }

    if (!confirm(`[CONFIRM] Ban IP address: ${userIP}?`)) return;

    try {
      const response = await adminApi.post('/api/admin/ip-bans', {
        ipAddress: userIP,
        reason: 'Banned via user management'
      });

      if (response.data.success) {
        alert('[SUCCESS] IP address banned');
        fetchIPBans();
      } else {
        alert('[ERROR] IP ban failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('IP ban error:', error);
      alert('[ERROR] System error occurred');
    }
  };

  const handleAddIPBan = async (e) => {
    e.preventDefault();
    if (!newBanIP.trim()) return;

    try {
      const response = await adminApi.post('/api/admin/ip-bans', {
        ipAddress: newBanIP,
        reason: 'Manual admin ban'
      });

      if (response.data.success) {
        alert('[SUCCESS] IP ban added');
        setNewBanIP('');
        fetchIPBans();
      } else {
        alert('[ERROR] IP ban creation failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('IP ban creation error:', error);
      alert('[ERROR] System error occurred');
    }
  };

  const handleRemoveIPBan = async (banId) => {
    if (!confirm('[CONFIRM] Remove this IP ban?')) return;

    try {
      const response = await adminApi.delete(`/api/admin/ip-bans/${banId}`);
      if (response.data.success) {
        alert('[SUCCESS] IP ban removed');
        fetchIPBans();
      } else {
        alert('[ERROR] IP ban removal failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('IP ban removal error:', error);
      alert('[ERROR] System error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white font-mono">Guvenlik Kontrolu</h1>
        <p className="text-gray-400 font-mono">Kullanici yonetimi, sifre sifirlama ve IP kisitlamalari</p>
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
            Kullanici Yonetimi ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('ip-bans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm font-mono ${
              activeTab === 'ip-bans'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            IP Yasaklamalari ({ipBans.length})
          </button>
        </nav>
      </div>

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-black border border-red-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    KULLANICI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    KONUM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    SON IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    OLUSTURULMA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    ISLEMLER
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-red-900/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-red-900 flex items-center justify-center border border-red-700">
                            <span className="text-red-200 font-medium font-mono">
                              {user.nickname.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-white font-mono">{user.nickname}</div>
                          <div className="text-sm text-gray-400 font-mono">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                      {user.city}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                      {user.last_ip || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-green-400 hover:text-green-300 font-mono"
                      >
                        SIFRE SIFIRLA
                      </button>
                      <button
                        onClick={() => handleBanUserIP(user.last_ip)}
                        className="text-purple-400 hover:text-purple-300 font-mono"
                      >
                        IP YASAKLA
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-300 font-mono"
                      >
                        SIL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-red-400 font-mono">[EMPTY]</div>
              <h3 className="text-xl font-semibold text-white mb-2 font-mono">No users found</h3>
              <p className="text-gray-400 font-mono">No registered users in database</p>
            </div>
          )}
        </div>
      )}

      {/* IP Bans Tab */}
      {activeTab === 'ip-bans' && (
        <div className="space-y-6">
          {/* Add IP Ban Form */}
          <div className="bg-black border border-red-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-400 mb-4 font-mono">[ADD] IP Restriction</h2>
            <form onSubmit={handleAddIPBan} className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={newBanIP}
                  onChange={(e) => setNewBanIP(e.target.value)}
                  placeholder="IP address or CIDR (e.g: 192.168.1.100 or 10.0.0.0/24)"
                  className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-red-900 hover:bg-red-800 text-red-200 px-6 py-2 rounded-lg transition-colors border border-red-700 font-mono"
              >
                [BAN] Add
              </button>
            </form>
          </div>

          {/* IP Bans Table */}
          <div className="bg-black border border-red-900 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                      [IP_ADDRESS]
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                      [REASON]
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                      [BAN_DATE]
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                      ISLEMLER
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-900">
                  {ipBans.map((ban) => (
                    <tr key={ban.id} className="hover:bg-red-900/20">
                      <td className="px-6 py-4 text-sm text-white font-mono">
                        {ban.ip_address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                        {ban.reason}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                        {new Date(ban.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleRemoveIPBan(ban.id)}
                          className="text-red-400 hover:text-red-300 font-mono"
                        >
                          [REMOVE]
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {ipBans.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-red-400 font-mono">[EMPTY]</div>
                <h3 className="text-xl font-semibold text-white mb-2 font-mono">No IP restrictions</h3>
                <p className="text-gray-400 font-mono">No banned IP addresses in database</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;