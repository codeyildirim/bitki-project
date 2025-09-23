import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import { join } from 'path';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sifalı-bitkiler-super-secret-key-2024';

// Database path for Vercel
const dbPath = join(process.cwd(), 'data', 'database.sqlite');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { nickname, password, confirmPassword, city, captchaToken } = req.body;

    // Basit validasyon
    if (!nickname || !password || !confirmPassword || !city) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanları doldurun'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Şifreler eşleşmiyor'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalı'
      });
    }

    // CAPTCHA kontrolü (geçici olarak bypass)
    if (!captchaToken) {
      return res.status(400).json({
        success: false,
        message: 'Güvenlik doğrulaması gerekli'
      });
    }

    // Database connection
    let db;
    try {
      db = new Database(dbPath);

      // Users tablosunu oluştur
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nickname TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          city TEXT,
          recovery_code TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Kullanıcı zaten var mı kontrol et
      const existingUser = db.prepare('SELECT * FROM users WHERE nickname = ?').get(nickname);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Bu kullanıcı adı zaten kullanılıyor'
        });
      }

      // Şifreyi hashle
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Recovery code oluştur
      const recoveryCode = 'REC-' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
      const hashedRecoveryCode = bcrypt.hashSync(recoveryCode, 10);

      // Kullanıcıyı kaydet
      const insertUser = db.prepare(`
        INSERT INTO users (nickname, password, city, recovery_code)
        VALUES (?, ?, ?, ?)
      `);

      const result = insertUser.run(nickname, hashedPassword, city, hashedRecoveryCode);

      // JWT token oluştur
      const token = jwt.sign(
        { id: result.lastInsertRowid, nickname, isAdmin: false },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Kullanıcı bilgilerini getir
      const user = {
        id: result.lastInsertRowid,
        nickname,
        city,
        isAdmin: false
      };

      db.close();

      res.status(201).json({
        success: true,
        message: 'Kayıt başarılı',
        data: {
          token,
          user,
          recoveryCode
        }
      });

    } catch (dbError) {
      if (db) db.close();
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Veritabanı hatası'
      });
    }

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
}