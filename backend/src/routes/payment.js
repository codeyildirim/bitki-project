import express from 'express';
import db from '../models/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Aktif ödeme yöntemlerini getir
router.get('/methods', async (req, res) => {
  try {
    const methods = await db.all(
      'SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY type'
    );

    // JSON parse et
    const parsedMethods = methods.map(method => ({
      ...method,
      details: JSON.parse(method.details)
    }));

    res.json({ success: true, data: parsedMethods });
  } catch (error) {
    console.error('Ödeme yöntemleri hatası:', error);
    res.status(500).json({ success: false, message: 'Ödeme yöntemleri yüklenirken hata oluştu' });
  }
});

// Admin: Ödeme yöntemi ekle/güncelle
router.post('/methods', authenticateToken, requireAdmin, async (req, res) => {
  const { type, title, details, is_active = true } = req.body;

  if (!type || !title || !details) {
    return res.status(400).json({
      success: false,
      message: 'Tüm alanlar gereklidir'
    });
  }

  try {
    // Mevcut yöntem var mı kontrol et
    const existing = await db.get(
      'SELECT id FROM payment_methods WHERE type = ?',
      [type]
    );

    if (existing) {
      // Güncelle
      await db.run(
        `UPDATE payment_methods
         SET title = ?, details = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE type = ?`,
        [title, JSON.stringify(details), is_active ? 1 : 0, type]
      );
    } else {
      // Yeni ekle
      await db.run(
        `INSERT INTO payment_methods (type, title, details, is_active)
         VALUES (?, ?, ?, ?)`,
        [type, title, JSON.stringify(details), is_active ? 1 : 0]
      );
    }

    res.json({
      success: true,
      message: existing ? 'Ödeme yöntemi güncellendi' : 'Ödeme yöntemi eklendi'
    });
  } catch (error) {
    console.error('Ödeme yöntemi kayıt hatası:', error);
    res.status(500).json({ success: false, message: 'Ödeme yöntemi kaydedilirken hata oluştu' });
  }
});

// Varsayılan ödeme yöntemlerini ekle
router.post('/setup-defaults', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const defaultMethods = [
      {
        type: 'iban',
        title: 'Banka Havalesi / EFT',
        details: JSON.stringify({
          bank_name: 'Ziraat Bankası',
          account_holder: 'Şifalı Bitkiler Ltd. Şti.',
          iban: 'TR00 0000 0000 0000 0000 0000 00',
          branch_code: '0000',
          account_number: '00000000',
          description: 'Açıklama kısmına sipariş numaranızı yazınız.'
        })
      },
      {
        type: 'btc',
        title: 'Bitcoin (BTC)',
        details: JSON.stringify({
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          network: 'Bitcoin Mainnet',
          min_confirmation: 2,
          qr_code: null
        })
      },
      {
        type: 'eth',
        title: 'Ethereum (ETH)',
        details: JSON.stringify({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3',
          network: 'Ethereum Mainnet',
          chain_id: 1,
          min_confirmation: 12,
          qr_code: null
        })
      },
      {
        type: 'usdt_trc20',
        title: 'USDT (TRC-20)',
        details: JSON.stringify({
          address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
          network: 'Tron Network',
          token_type: 'TRC-20',
          min_confirmation: 20,
          qr_code: null
        })
      }
    ];

    for (const method of defaultMethods) {
      await db.run(
        `INSERT OR REPLACE INTO payment_methods (type, title, details, is_active)
         VALUES (?, ?, ?, 1)`,
        [method.type, method.title, method.details]
      );
    }

    res.json({
      success: true,
      message: 'Varsayılan ödeme yöntemleri eklendi'
    });
  } catch (error) {
    console.error('Varsayılan ödeme yöntemleri hatası:', error);
    res.status(500).json({ success: false, message: 'Varsayılan ödeme yöntemleri eklenirken hata oluştu' });
  }
});

export default router;