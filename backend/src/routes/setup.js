import express from 'express';
import { hashPassword } from '../utils/crypto.js';
import db from '../models/database.js';

const router = express.Router();

// Tek seferlik admin oluşturma endpoint'i
// UYARI: Production'da bu endpoint'i kullandıktan sonra devre dışı bırakın!
router.post('/create-admin', async (req, res) => {
  try {
    // Güvenlik kontrolü - sadece admin yoksa çalışsın
    const existingAdmin = await db.get('SELECT * FROM users WHERE is_admin = 1');

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin hesabı zaten mevcut'
      });
    }

    // Sabit admin bilgileri
    const adminData = {
      nickname: 'admin',
      password: 'admin123',
      recoveryCode: 'ADMIN-RECOVERY-2024',
      city: 'istanbul'
    };

    const passwordHash = hashPassword(adminData.password);
    const recoveryCodeHash = hashPassword(adminData.recoveryCode);

    const result = await db.run(
      `INSERT INTO users (nickname, password_hash, recovery_code_hash, city, is_admin, created_at)
       VALUES (?, ?, ?, ?, 1, datetime('now'))`,
      [adminData.nickname, passwordHash, recoveryCodeHash, adminData.city]
    );

    console.log('✅ Admin hesabı oluşturuldu!');
    console.log('Kullanıcı adı: admin');
    console.log('Şifre: admin123');
    console.log('Kurtarma kodu: ADMIN-RECOVERY-2024');

    res.json({
      success: true,
      message: 'Admin hesabı başarıyla oluşturuldu',
      credentials: {
        username: 'admin',
        password: 'admin123',
        recoveryCode: 'ADMIN-RECOVERY-2024'
      }
    });

  } catch (error) {
    console.error('Admin oluşturma hatası:', error);

    // Eğer kullanıcı zaten varsa
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        success: false,
        message: 'Admin kullanıcı adı zaten kullanımda'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Admin hesabı oluşturulamadı'
    });
  }
});

// Veritabanı durumunu kontrol et
router.get('/check', async (req, res) => {
  try {
    const adminCount = await db.get('SELECT COUNT(*) as count FROM users WHERE is_admin = 1');
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');

    res.json({
      success: true,
      data: {
        hasAdmin: adminCount.count > 0,
        totalUsers: userCount.count,
        adminCount: adminCount.count
      }
    });
  } catch (error) {
    console.error('Veritabanı kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Veritabanı kontrolü başarısız'
    });
  }
});

export default router;