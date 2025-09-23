import { getAllUsers, deleteUser } from '../_lib/storage.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Kullanıcıları listele
    try {
      console.log('📋 Admin API: Kullanıcı listesi istendi');
      const users = await getAllUsers();

      // Format users for admin panel
      const formattedUsers = users.map(user => ({
        id: user.id,
        nickname: user.nickname,
        city: user.city || 'İstanbul',
        created_at: user.created_at,
        last_login: user.last_login,
        status: 'active',
        is_admin: user.is_admin
      }));

      console.log('✅ Admin API: Kullanıcı listesi döndürüldü:', formattedUsers.length, 'users');

      res.status(200).json({
        success: true,
        data: formattedUsers
      });
    } catch (error) {
      console.error('❌ Admin API: Kullanıcı listesi hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Kullanıcı listesi alınamadı'
      });
    }
  } else if (req.method === 'DELETE') {
    // Kullanıcı silme
    try {
      const userId = parseInt(req.query.id || req.body.id);

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcı ID gerekli'
        });
      }

      console.log('🗑️ Admin API: Kullanıcı siliniyor:', userId);

      const result = await deleteUser(userId);

      if (result) {
        console.log('✅ Admin API: Kullanıcı silindi:', userId);
        res.status(200).json({
          success: true,
          message: 'Kullanıcı başarıyla silindi'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }
    } catch (error) {
      console.error('❌ Admin API: Kullanıcı silme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Kullanıcı silinemedi'
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}