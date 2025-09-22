import { responseSuccess, responseError } from '../utils/helpers.js';
import db from '../models/database.js';

// Kupon doğrulama
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json(responseError('Kupon kodu gereklidir'));
    }

    const coupon = await db.get(`
      SELECT * FROM coupons
      WHERE code = ?
        AND is_active = 1
        AND (valid_from IS NULL OR valid_from <= datetime('now'))
        AND (valid_until IS NULL OR valid_until >= datetime('now'))
        AND (usage_limit IS NULL OR used_count < usage_limit)
    `, [code.toUpperCase()]);

    if (!coupon) {
      return res.status(404).json(responseError('Geçersiz veya süresi dolmuş kupon'));
    }

    // Minimum tutar kontrolü
    if (coupon.min_purchase_amount && cartTotal < coupon.min_purchase_amount) {
      return res.status(400).json(responseError(`Minimum alışveriş tutarı ${coupon.min_purchase_amount} TL olmalıdır`));
    }

    // Kullanıcının bu kuponu daha önce kullanıp kullanmadığını kontrol et
    const previousUsage = await db.get(`
      SELECT * FROM coupon_usage
      WHERE coupon_id = ? AND user_id = ?
    `, [coupon.id, req.user.id]);

    if (previousUsage) {
      return res.status(400).json(responseError('Bu kuponu daha önce kullandınız'));
    }

    // İndirim hesaplama
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (cartTotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = coupon.max_discount_amount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    res.json(responseSuccess({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountAmount: discountAmount,
        finalTotal: cartTotal - discountAmount
      }
    }, 'Kupon başarıyla uygulandı'));

  } catch (error) {
    console.error('Kupon doğrulama hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - Kuponları listele
export const getCoupons = async (req, res) => {
  try {
    const coupons = await db.all(`
      SELECT c.*,
        (SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = c.id) as total_usage
      FROM coupons c
      ORDER BY c.created_at DESC
    `);

    res.json(responseSuccess(coupons));
  } catch (error) {
    console.error('Kuponlar getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - Kupon oluştur
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      validFrom,
      validUntil
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json(responseError('Kupon kodu, indirim tipi ve değeri gereklidir'));
    }

    // Kupon kodu benzersizlik kontrolü
    const existingCoupon = await db.get('SELECT * FROM coupons WHERE code = ?', [code.toUpperCase()]);
    if (existingCoupon) {
      return res.status(400).json(responseError('Bu kupon kodu zaten kullanılıyor'));
    }

    const result = await db.run(`
      INSERT INTO coupons (
        code, description, discount_type, discount_value,
        min_purchase_amount, max_discount_amount, usage_limit,
        valid_from, valid_until, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minPurchaseAmount || 0,
      maxDiscountAmount || null,
      usageLimit || null,
      validFrom || null,
      validUntil || null
    ]);

    res.json(responseSuccess({ id: result.id }, 'Kupon oluşturuldu'));

  } catch (error) {
    console.error('Kupon oluşturma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - Kupon güncelle
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await db.run('UPDATE coupons SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
    res.json(responseSuccess(null, 'Kupon güncellendi'));

  } catch (error) {
    console.error('Kupon güncelleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - Kupon sil
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    // Kullanım geçmişi var mı kontrol et
    const usage = await db.get('SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ?', [id]);
    if (usage.count > 0) {
      return res.status(400).json(responseError('Kullanılmış kupon silinemez, deaktive edebilirsiniz'));
    }

    await db.run('DELETE FROM coupons WHERE id = ?', [id]);
    res.json(responseSuccess(null, 'Kupon silindi'));

  } catch (error) {
    console.error('Kupon silme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - Kampanyaları listele
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await db.all(`
      SELECT c.*, cat.name as category_name
      FROM campaigns c
      LEFT JOIN categories cat ON c.required_category_id = cat.id
      ORDER BY c.created_at DESC
    `);

    res.json(responseSuccess(campaigns));
  } catch (error) {
    console.error('Kampanyalar getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - Kampanya oluştur
export const createCampaign = async (req, res) => {
  try {
    const {
      name,
      description,
      campaignType,
      discountPercentage,
      minItems,
      requiredCategoryId,
      validFrom,
      validUntil
    } = req.body;

    if (!name || !campaignType) {
      return res.status(400).json(responseError('Kampanya adı ve tipi gereklidir'));
    }

    const result = await db.run(`
      INSERT INTO campaigns (
        name, description, campaign_type, discount_percentage,
        min_items, required_category_id, valid_from, valid_until, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      name,
      description,
      campaignType,
      discountPercentage || null,
      minItems || null,
      requiredCategoryId || null,
      validFrom || null,
      validUntil || null
    ]);

    res.json(responseSuccess({ id: result.id }, 'Kampanya oluşturuldu'));

  } catch (error) {
    console.error('Kampanya oluşturma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - Kampanya güncelle
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await db.run('UPDATE campaigns SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
    res.json(responseSuccess(null, 'Kampanya güncellendi'));

  } catch (error) {
    console.error('Kampanya güncelleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Aktif kampanyaları getir (public)
export const getActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await db.all(`
      SELECT c.*, cat.name as category_name
      FROM campaigns c
      LEFT JOIN categories cat ON c.required_category_id = cat.id
      WHERE c.is_active = 1
        AND (c.valid_from IS NULL OR c.valid_from <= datetime('now'))
        AND (c.valid_until IS NULL OR c.valid_until >= datetime('now'))
      ORDER BY c.created_at DESC
    `);

    res.json(responseSuccess(campaigns));
  } catch (error) {
    console.error('Aktif kampanyalar getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};