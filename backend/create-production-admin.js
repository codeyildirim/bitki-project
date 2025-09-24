// Production Admin Account Creator for Render.com
// Run this script after deployment to create admin account

import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Production database path for Render.com
const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/database.sqlite'
  : join(__dirname, 'database.sqlite');

async function createProductionAdmin() {
  console.log('🔄 Creating production admin account...');
  console.log('📍 Database path:', DB_PATH);

  const db = new sqlite3.Database(DB_PATH);

  return new Promise((resolve, reject) => {
    // Check if admin already exists
    db.get('SELECT id FROM users WHERE is_admin = 1', (err, row) => {
      if (err) {
        console.error('❌ Database error:', err);
        reject(err);
        return;
      }

      if (row) {
        console.log('⚠️  Admin account already exists!');
        console.log('✅ Use credentials: admin / admin123');
        db.close();
        resolve();
        return;
      }

      // Create admin account
      const adminPassword = bcrypt.hashSync('admin123', 10);
      const recoveryCode = bcrypt.hashSync('ADMIN-RECOVERY-2024', 10);

      db.run(`
        INSERT INTO users (nickname, password_hash, recovery_code_hash, city, is_admin, registration_ip, last_ip)
        VALUES (?, ?, ?, ?, 1, ?, ?)
      `, ['admin', adminPassword, recoveryCode, 'istanbul', 'production', 'production'], function(err) {

        if (err) {
          console.error('❌ Failed to create admin:', err);
          reject(err);
          return;
        }

        console.log('✅ Production admin account created successfully!');
        console.log('');
        console.log('🔑 Admin Credentials:');
        console.log('👤 Username: admin');
        console.log('🔒 Password: admin123');
        console.log('🔐 Recovery Code: ADMIN-RECOVERY-2024');
        console.log('🏠 City: istanbul');
        console.log('');
        console.log('🌐 Admin Panel: https://bitki-admin.vercel.app');
        console.log('');
        console.log('⚠️  IMPORTANT: Change password after first login!');

        db.close();
        resolve();
      });
    });
  });
}

// Run the script
createProductionAdmin().catch(console.error);