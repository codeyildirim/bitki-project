import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sifalı-bitkiler-super-secret-key-2024';

// Geçici olarak memory-based user storage (production'da external DB kullanılacak)
let users = [];

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

    // Kullanıcı zaten var mı kontrol et
    const existingUser = users.find(u => u.nickname === nickname);
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
    const userId = Date.now();
    const newUser = {
      id: userId,
      nickname,
      password: hashedPassword,
      city,
      recoveryCode: hashedRecoveryCode,
      createdAt: new Date().toISOString(),
      isAdmin: false
    };

    users.push(newUser);

    // JWT token oluştur
    const token = jwt.sign(
      { id: userId, nickname, isAdmin: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Kullanıcı bilgilerini hazırla
    const user = {
      id: userId,
      nickname,
      city,
      isAdmin: false
    };

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: {
        token,
        user,
        recoveryCode
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
}