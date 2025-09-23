import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sifalı-bitkiler-super-secret-key-2024';

// Shared users array (gerçek production'da external DB kullanılacak)
// Bu geçici çözüm - users array'i register.js ile paylaşımı için
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
    const { nickname, password, captchaToken } = req.body;

    // Basit validasyon
    if (!nickname || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı ve şifre gerekli'
      });
    }

    // CAPTCHA kontrolü (geçici olarak bypass)
    if (!captchaToken) {
      return res.status(400).json({
        success: false,
        message: 'Güvenlik doğrulaması gerekli'
      });
    }

    // Kullanıcıyı bul
    const user = users.find(u => u.nickname === nickname);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı'
      });
    }

    // Şifreyi kontrol et
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı'
      });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id, nickname: user.nickname, isAdmin: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Kullanıcı bilgilerini hazırla
    const userInfo = {
      id: user.id,
      nickname: user.nickname,
      city: user.city,
      isAdmin: false
    };

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        token,
        user: userInfo
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
}