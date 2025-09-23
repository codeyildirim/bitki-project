import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sifali-bitkiler-secret-key-2024';

// Register
export const register = async (req, res) => {
  try {
    const { nickname, password, confirmPassword, city } = req.body;
    const db = getDatabase();

    // Validation
    if (!nickname || !password || !confirmPassword) {
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

    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE nickname = ?', nickname);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı adı zaten kullanılıyor'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create recovery code
    const recoveryCode = 'REC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const hashedRecoveryCode = await bcrypt.hash(recoveryCode, 10);

    // Insert user
    const result = await db.run(
      'INSERT INTO users (nickname, password, city, recovery_code) VALUES (?, ?, ?, ?)',
      [nickname, hashedPassword, city || 'İstanbul', hashedRecoveryCode]
    );

    // Create JWT token
    const token = jwt.sign(
      { id: result.lastID, nickname, is_admin: 0 },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log registration
    await db.run(
      'INSERT INTO user_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)',
      [result.lastID, 'REGISTER', `Yeni kullanıcı kaydı: ${nickname}`, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: {
        token,
        user: {
          id: result.lastID,
          nickname,
          city,
          is_admin: 0
        },
        recoveryCode
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında hata oluştu'
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { nickname, password } = req.body;
    const db = getDatabase();

    // Validation
    if (!nickname || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı ve şifre gerekli'
      });
    }

    // Get user
    const user = await db.get('SELECT * FROM users WHERE nickname = ?', nickname);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı'
      });
    }

    // Update last login
    await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', user.id);

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, nickname: user.nickname, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log login
    await db.run(
      'INSERT INTO user_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)',
      [user.id, 'LOGIN', `Giriş yapıldı: ${nickname}`, req.ip]
    );

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          city: user.city,
          is_admin: user.is_admin
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında hata oluştu'
    });
  }
};

// Get profile
export const getProfile = async (req, res) => {
  try {
    const db = getDatabase();
    const user = await db.get(
      'SELECT id, nickname, city, created_at, last_login, is_admin FROM users WHERE id = ?',
      req.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil bilgileri alınamadı'
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { city, currentPassword, newPassword } = req.body;
    const db = getDatabase();

    // Get current user
    const user = await db.get('SELECT * FROM users WHERE id = ?', req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mevcut şifre gerekli'
        });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Mevcut şifre hatalı'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Yeni şifre en az 6 karakter olmalı'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.userId]);
    }

    // Update city if provided
    if (city) {
      await db.run('UPDATE users SET city = ? WHERE id = ?', [city, req.userId]);
    }

    res.json({
      success: true,
      message: 'Profil güncellendi'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil güncellenemedi'
    });
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile
};