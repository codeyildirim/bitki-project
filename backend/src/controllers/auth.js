import { hashPassword, comparePassword, generateJWT, generateRecoveryCode, validateNickname, validatePassword } from '../utils/crypto.js';
import { responseSuccess, responseError } from '../utils/helpers.js';
import db from '../models/database.js';

export const register = async (req, res) => {
  try {
    const { nickname, password, confirmPassword, city } = req.body;

    // Note: CAPTCHA validation is done via middleware in routes

    // String alanları temizle ve normalize et
    const cleanNickname = (nickname ?? '').normalize('NFC').trim();
    const cleanCity = (city ?? '').normalize('NFC').trim();
    const rawPassword = password ?? '';
    const rawConfirm = confirmPassword ?? '';
    const pwd = rawPassword.normalize('NFC').trim();
    const cpwd = rawConfirm.normalize('NFC').trim();

    if (!validateNickname(cleanNickname)) {
      return res.status(400).json(responseError('Nickname 3-24 karakter olmalı ve sadece harf, rakam, altçizgi, nokta içermelidir'));
    }

    if (!validatePassword(pwd)) {
      return res.status(400).json(responseError('Şifre en az 6 karakter olmalıdır'));
    }

    if (pwd !== cpwd) {
      return res.status(400).json(responseError('Şifreler eşleşmiyor'));
    }

    if (!cleanCity) {
      return res.status(400).json(responseError('Şehir seçimi zorunludur'));
    }

    const existingUser = await db.get('SELECT * FROM users WHERE nickname = ?', [cleanNickname]);
    if (existingUser) {
      return res.status(400).json(responseError('Bu nickname zaten kullanılıyor'));
    }

    const recoveryCode = generateRecoveryCode();
    const passwordHash = hashPassword(pwd);
    const recoveryCodeHash = hashPassword(recoveryCode);

    const result = await db.run(
      'INSERT INTO users (nickname, password_hash, recovery_code_hash, city) VALUES (?, ?, ?, ?)',
      [cleanNickname, passwordHash, recoveryCodeHash, cleanCity]
    );

    const token = generateJWT({ userId: result.id, nickname: cleanNickname });

    res.json(responseSuccess({
      token,
      user: { id: result.id, nickname: cleanNickname, city: cleanCity },
      recoveryCode,
      message: 'Bu kurtarma kodunu güvenli bir yerde saklayın! Tekrar gösterilmeyecektir.'
    }, 'Kayıt başarılı'));

  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const login = async (req, res) => {
  try {
    const { nickname, password } = req.body;

    // Note: CAPTCHA validation is done via middleware in routes

    // Giriş verilerini temizle
    const cleanNickname = (nickname ?? '').normalize('NFC').trim();
    const cleanPassword = (password ?? '').normalize('NFC').trim();

    if (!cleanNickname || !cleanPassword) {
      return res.status(400).json(responseError('Nickname ve şifre gereklidir'));
    }

    const user = await db.get('SELECT * FROM users WHERE nickname = ?', [cleanNickname]);
    if (!user || !comparePassword(cleanPassword, user.password_hash)) {
      return res.status(401).json(responseError('Geçersiz giriş bilgileri'));
    }

    const token = generateJWT({ userId: user.id, nickname: user.nickname });

    res.json(responseSuccess({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        city: user.city,
        isAdmin: !!user.is_admin
      }
    }, 'Giriş başarılı'));

  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const recoverPassword = async (req, res) => {
  try {
    const { nickname, recoveryCode, newPassword, confirmPassword } = req.body;

    // Verileri temizle ve normalize et
    const cleanNickname = (nickname ?? '').normalize('NFC').trim();
    const cleanRecoveryCode = (recoveryCode ?? '').normalize('NFC').trim();
    const cleanNewPassword = (newPassword ?? '').normalize('NFC').trim();
    const cleanConfirmPassword = (confirmPassword ?? '').normalize('NFC').trim();

    if (!cleanNickname || !cleanRecoveryCode || !cleanNewPassword || !cleanConfirmPassword) {
      return res.status(400).json(responseError('Tüm alanlar gereklidir'));
    }

    if (!validatePassword(cleanNewPassword)) {
      return res.status(400).json(responseError('Şifre en az 6 karakter olmalıdır'));
    }

    if (cleanNewPassword !== cleanConfirmPassword) {
      return res.status(400).json(responseError('Şifreler eşleşmiyor'));
    }

    const user = await db.get('SELECT * FROM users WHERE nickname = ?', [cleanNickname]);
    if (!user) {
      return res.status(404).json(responseError('Kullanıcı bulunamadı'));
    }

    if (!comparePassword(cleanRecoveryCode, user.recovery_code_hash)) {
      return res.status(401).json(responseError('Geçersiz kurtarma kodu'));
    }

    const newPasswordHash = hashPassword(cleanNewPassword);
    const newRecoveryCode = generateRecoveryCode();
    const newRecoveryCodeHash = hashPassword(newRecoveryCode);

    await db.run(
      'UPDATE users SET password_hash = ?, recovery_code_hash = ? WHERE id = ?',
      [newPasswordHash, newRecoveryCodeHash, user.id]
    );

    res.json(responseSuccess({
      newRecoveryCode,
      message: 'Yeni kurtarma kodunuzu güvenli bir yerde saklayın!'
    }, 'Şifre başarıyla sıfırlandı'));

  } catch (error) {
    console.error('Şifre kurtarma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, nickname, city, is_admin, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json(responseSuccess(user));
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { city } = req.body;

    const cleanCity = (city ?? '').normalize('NFC').trim();

    if (!cleanCity) {
      return res.status(400).json(responseError('Şehir gereklidir'));
    }

    await db.run('UPDATE users SET city = ? WHERE id = ?', [cleanCity, req.user.id]);

    res.json(responseSuccess(null, 'Profil güncellendi'));
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};