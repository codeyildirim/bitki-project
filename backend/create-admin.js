import bcrypt from 'bcrypt';
import db from './src/models/database.js';

(async () => {
  try {
    // db is already imported
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const result = await db.run(
      'INSERT INTO users (nickname, password, city, is_admin, recovery_code) VALUES (?, ?, ?, ?, ?)',
      ['admin', hashedPassword, 'İstanbul', 1, 'ADMIN-RECOVERY-2024']
    );

    console.log('✅ Admin kullanıcısı oluşturuldu!');
    console.log('Kullanıcı Adı: admin');
    console.log('Şifre: admin123');
    console.log('Kurtarma Kodu: ADMIN-RECOVERY-2024');
    console.log('ID:', result.lastID);
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
})();