import { responseSuccess, responseError } from '../utils/helpers.js';
import db from '../models/database.js';

export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await db.all(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );

    res.json(responseSuccess(addresses));

  } catch (error) {
    console.error('Adresler getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const createAddress = async (req, res) => {
  try {
    const {
      title,
      full_name,
      phone,
      city,
      district,
      address,
      postal_code,
      is_default = false
    } = req.body;

    // Temel validasyon
    if (!title || !full_name || !phone || !city || !district || !address) {
      return res.status(400).json(responseError('Tüm zorunlu alanlar doldurulmalıdır'));
    }

    // Telefon numarası validasyonu (Türkiye formatı)
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json(responseError('Geçerli bir telefon numarası giriniz'));
    }

    // Eğer varsayılan adres yapılacaksa, diğer varsayılan adresleri kaldır
    if (is_default) {
      await db.run(
        'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
        [req.user.id]
      );
    }

    const result = await db.run(`
      INSERT INTO user_addresses (
        user_id, title, full_name, phone, city, district, address, postal_code, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, title, full_name, phone, city, district, address, postal_code, is_default ? 1 : 0]);

    const newAddress = await db.get('SELECT * FROM user_addresses WHERE id = ?', [result.id]);

    res.json(responseSuccess(newAddress, 'Adres başarıyla eklendi'));

  } catch (error) {
    console.error('Adres oluşturma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      full_name,
      phone,
      city,
      district,
      address,
      postal_code,
      is_default
    } = req.body;

    // Adresin kullanıcıya ait olduğunu kontrol et
    const existingAddress = await db.get(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existingAddress) {
      return res.status(404).json(responseError('Adres bulunamadı'));
    }

    // Eğer varsayılan adres yapılacaksa, diğer varsayılan adresleri kaldır
    if (is_default && !existingAddress.is_default) {
      await db.run(
        'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
        [req.user.id]
      );
    }

    await db.run(`
      UPDATE user_addresses SET
        title = ?, full_name = ?, phone = ?, city = ?, district = ?,
        address = ?, postal_code = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [title, full_name, phone, city, district, address, postal_code, is_default ? 1 : 0, id, req.user.id]);

    const updatedAddress = await db.get('SELECT * FROM user_addresses WHERE id = ?', [id]);

    res.json(responseSuccess(updatedAddress, 'Adres başarıyla güncellendi'));

  } catch (error) {
    console.error('Adres güncelleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Adresin kullanıcıya ait olduğunu kontrol et
    const existingAddress = await db.get(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existingAddress) {
      return res.status(404).json(responseError('Adres bulunamadı'));
    }

    await db.run('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [id, req.user.id]);

    res.json(responseSuccess(null, 'Adres başarıyla silindi'));

  } catch (error) {
    console.error('Adres silme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Adresin kullanıcıya ait olduğunu kontrol et
    const existingAddress = await db.get(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existingAddress) {
      return res.status(404).json(responseError('Adres bulunamadı'));
    }

    // Tüm adresleri varsayılan olmayan yap
    await db.run('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);

    // Seçilen adresi varsayılan yap
    await db.run(
      'UPDATE user_addresses SET is_default = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json(responseSuccess(null, 'Varsayılan adres güncellendi'));

  } catch (error) {
    console.error('Varsayılan adres ayarlama hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};