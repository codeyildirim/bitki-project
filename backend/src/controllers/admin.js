import { responseSuccess, responseError, logAdminAction } from '../utils/helpers.js';
import { hashPassword as bcryptHash, comparePassword, generateJWT } from '../utils/crypto.js';
import db from '../models/database.js';
import { validateTieredPricing } from '../middleware/validateTieredPricing.js';

// Admin Authentication
export const adminLogin = async (req, res) => {
  try {
    const { nickname, password, adminCode } = req.body;

    // Clean and normalize input data
    const cleanNickname = (nickname ?? '').normalize('NFC').trim();
    const cleanPassword = (password ?? '').normalize('NFC').trim();
    const cleanAdminCode = (adminCode ?? '').normalize('NFC').trim();

    if (!cleanNickname || !cleanPassword) {
      return res.status(400).json(responseError('Nickname ve şifre gereklidir'));
    }

    // Check for optional admin access code
    const requiredAdminCode = process.env.ADMIN_ACCESS_CODE;
    if (requiredAdminCode && cleanAdminCode !== requiredAdminCode) {
      return res.status(403).json(responseError('Geçersiz admin erişim kodu'));
    }

    // Find user and verify admin status
    const user = await db.get('SELECT * FROM users WHERE nickname = ?', [cleanNickname]);
    if (!user || !comparePassword(cleanPassword, user.password_hash)) {
      return res.status(401).json(responseError('Geçersiz giriş bilgileri'));
    }

    if (!user.is_admin) {
      return res.status(403).json(responseError('Admin yetkisi gerekiyor'));
    }

    // Generate JWT with admin role
    const token = generateJWT({
      userId: user.id,
      nickname: user.nickname,
      role: 'admin'
    });

    // Log admin login
    await logAdminAction(db, user.id, 'ADMIN_LOGIN', 'Admin sisteme giriş yaptı', req);

    // Return token at root level for easier access
    res.json({
      success: true,
      message: 'Admin girişi başarılı',
      token,
      admin: {
        id: user.id,
        nickname: user.nickname,
        city: user.city,
        isAdmin: true
      },
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          city: user.city,
          isAdmin: true
        }
      }
    });

  } catch (error) {
    console.error('Admin giriş hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Kullanıcı Yönetimi
export const getUsers = async (req, res) => {
  try {
    const users = await db.all(`
      SELECT id, nickname, city, is_admin, created_at,
             registration_ip, last_ip, last_login_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(responseSuccess(users));
  } catch (error) {
    console.error('Kullanıcılar getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️  DELETE USER REQUEST:', {
      userId: id,
      adminId: req.user.id,
      adminNickname: req.user.nickname,
      timestamp: new Date().toISOString()
    });

    if (parseInt(id) === req.user.id) {
      console.log('❌ Admin tried to delete themselves');
      return res.status(400).json(responseError('Kendi hesabınızı silemezsiniz'));
    }

    // Kullanıcı var mı kontrol et
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      console.log('❌ User not found in database:', id);
      return res.status(404).json(responseError('Kullanıcı bulunamadı'));
    }

    console.log('👤 Found user to delete:', {
      id: user.id,
      nickname: user.nickname,
      city: user.city,
      created_at: user.created_at,
      is_admin: user.is_admin
    });

    // Silme işlemini gerçekleştir
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    console.log('🗑️  DELETE SQL RESULT:', {
      changes: result.changes,
      deletedUserId: id,
      success: result.changes > 0
    });

    if (result.changes === 0) {
      console.error('⚠️  DELETE: No rows affected - user might not exist');
      return res.status(404).json(responseError('Kullanıcı bulunamadı veya silinemedi'));
    }

    // Kontrolü - gerçekten silindiğini doğrula
    const checkDeleted = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (checkDeleted) {
      console.error('🚨 CRITICAL: User still exists after DELETE:', checkDeleted);
      return res.status(500).json(responseError('Kullanıcı silinemedi'));
    } else {
      console.log('✅ VERIFIED: User successfully deleted from database');
    }

    // Admin log kaydet
    await logAdminAction(db, req.user.id, 'DELETE_USER', `Kullanıcı silindi: ${user.nickname} (ID: ${id})`, req);

    console.log('🎉 DELETE USER COMPLETED successfully');
    res.json(responseSuccess(null, 'Kullanıcı başarıyla silindi'));
  } catch (error) {
    console.error('❌ Kullanıcı silme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json(responseError('Şifre en az 6 karakter olmalıdır'));
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json(responseError('Kullanıcı bulunamadı'));
    }

    const passwordHash = bcryptHash(newPassword);
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);

    await logAdminAction(db, req.user.id, 'RESET_PASSWORD', `Şifre sıfırlandı: ${user.nickname}`, req);

    res.json(responseSuccess(null, 'Kullanıcı şifresi sıfırlandı'));
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// IP Ban Yönetimi
export const getIPBans = async (req, res) => {
  try {
    const bans = await db.all('SELECT * FROM ip_bans ORDER BY created_at DESC');
    res.json(responseSuccess(bans));
  } catch (error) {
    console.error('IP banları getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const addIPBan = async (req, res) => {
  try {
    const { ipAddress } = req.body;

    if (!ipAddress) {
      return res.status(400).json(responseError('IP adresi gereklidir'));
    }

    const isCIDR = ipAddress.includes('/');

    await db.run('INSERT INTO ip_bans (ip_address, is_cidr) VALUES (?, ?)', [ipAddress, isCIDR]);

    await logAdminAction(db, req.user.id, 'ADD_IP_BAN', `IP banlandı: ${ipAddress}`, req);

    res.json(responseSuccess(null, 'IP banı eklendi'));
  } catch (error) {
    console.error('IP banı ekleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const removeIPBan = async (req, res) => {
  try {
    const { id } = req.params;

    await db.run('DELETE FROM ip_bans WHERE id = ?', [id]);

    res.json(responseSuccess(null, 'IP banı kaldırıldı'));
  } catch (error) {
    console.error('IP banı kaldırma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Ürün Yönetimi
export const createProduct = async (req, res) => {
  try {
    console.log('📦 CREATE PRODUCT REQUEST:', {
      body: req.body,
      files: req.files ? Object.keys(req.files) : 'No files',
      filesCount: req.files ? Object.values(req.files).flat().length : 0
    });

    const { name, description, price, stock, category_id } = req.body;

    // Check if at least one image is provided
    if (!req.files || !req.files.images || req.files.images.length === 0) {
      console.log('❌ Validation failed: no images provided');
      return res.status(400).json({
        success: false,
        message: 'En az bir ürün görseli gereklidir'
      });
    }

    // Validate required fields
    if (!name || name.trim() === '') {
      console.log('❌ Validation failed: name required');
      return res.status(400).json(responseError('Ürün adı gereklidir'));
    }

    if (!description || description.trim() === '') {
      console.log('❌ Validation failed: description required');
      return res.status(400).json(responseError('Ürün açıklaması gereklidir'));
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      console.log('❌ Validation failed: invalid price');
      return res.status(400).json(responseError('Geçerli bir fiyat gereklidir'));
    }

    if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      console.log('❌ Validation failed: invalid stock');
      return res.status(400).json(responseError('Geçerli bir stok miktarı gereklidir'));
    }

    if (!category_id || isNaN(parseInt(category_id))) {
      console.log('❌ Validation failed: invalid category_id');
      return res.status(400).json(responseError('Geçerli bir kategori seçilmelidir'));
    }

    const baseURL = process.env.BASE_URL || 'https://seninrenderlink.onrender.com';
    console.log('🌐 Base URL:', baseURL);

    // Handle images
    const images = req.files?.images
      ? req.files.images.map(file => `${baseURL}/uploads/products/${file.filename}`)
      : [];

    // Handle videos
    const videos = req.files?.videos
      ? req.files.videos.map(file => `${baseURL}/uploads/videos/${file.filename}`)
      : [];

    console.log('📁 File processing:', {
      imagesCount: images.length,
      videosCount: videos.length,
      images: images.slice(0, 2), // Show first 2 for brevity
      videos: videos.slice(0, 2)
    });

    // Handle tiered_pricing if provided
    const tieredPricingData = req.body.tiered_pricing;

    // Validate tiered pricing structure
    if (tieredPricingData) {
      const validation = validateTieredPricing(tieredPricingData);
      if (!validation.ok) {
        console.log('❌ Tiered pricing validation failed:', validation.message);
        return res.status(400).json(responseError(validation.message));
      }
    }

    const tieredPricing = tieredPricingData ? JSON.stringify(tieredPricingData) : null;
    const discountBadges = req.body.discount_badges ? 1 : 0;

    const result = await db.run(`
      INSERT INTO products (name, description, price, stock, category_id, images, videos, tiered_pricing, discount_badges)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description, price, stock, category_id || null, JSON.stringify(images), JSON.stringify(videos), tieredPricing, discountBadges]);

    console.log('✅ Product created successfully:', { id: result.id, name, hasTieredPricing: !!tieredPricing, discountBadges });
    res.json(responseSuccess({ id: result.id }, 'Ürün oluşturuldu'));
  } catch (error) {
    console.error('❌ Ürün oluşturma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, is_active, tiered_pricing, discount_badges } = req.body;

    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json(responseError('Ürün bulunamadı'));
    }

    const baseURL = process.env.BASE_URL || 'https://seninrenderlink.onrender.com';

    // Handle existing images
    let images = product.images ? JSON.parse(product.images) : [];
    if (req.files?.images && req.files.images.length > 0) {
      const newImages = req.files.images.map(file => `${baseURL}/uploads/products/${file.filename}`);
      images = [...images, ...newImages];
    }

    // Handle existing videos
    let videos = product.videos ? JSON.parse(product.videos) : [];
    if (req.files?.videos && req.files.videos.length > 0) {
      const newVideos = req.files.videos.map(file => `${baseURL}/uploads/videos/${file.filename}`);
      videos = [...videos, ...newVideos];
    }

    // Handle tiered_pricing update
    if (tiered_pricing) {
      const validation = validateTieredPricing(tiered_pricing);
      if (!validation.ok) {
        return res.status(400).json(responseError(validation.message));
      }
    }

    const tieredPricingValue = tiered_pricing ? JSON.stringify(tiered_pricing) : null;
    const discountBadgesValue = discount_badges ? 1 : 0;

    await db.run(`
      UPDATE products
      SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, images = ?, videos = ?, is_active = ?, tiered_pricing = ?, discount_badges = ?
      WHERE id = ?
    `, [name, description, price, stock, category_id || null, JSON.stringify(images), JSON.stringify(videos), is_active !== undefined ? is_active : product.is_active, tieredPricingValue, discountBadgesValue, id]);

    res.json(responseSuccess(null, 'Ürün güncellendi'));
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await db.run('UPDATE products SET is_active = 0 WHERE id = ?', [id]);

    res.json(responseSuccess(null, 'Ürün silindi'));
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Kategori Yönetimi
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json(responseError('Kategori adı gereklidir'));
    }

    const result = await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);

    res.json(responseSuccess({ id: result.id }, 'Kategori oluşturuldu'));
  } catch (error) {
    console.error('Kategori oluşturma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Sipariş Yönetimi
export const getAllOrders = async (req, res) => {
  try {
    const orders = await db.all(`
      SELECT o.*, u.nickname as user_nickname,
      GROUP_CONCAT(
        json_object(
          'productName', p.name,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    const formattedOrders = orders.map(order => ({
      ...order,
      shipping_address: JSON.parse(order.shipping_address),
      items: order.items ? order.items.split(',').map(item => JSON.parse(item)) : []
    }));

    res.json(responseSuccess(formattedOrders));
  } catch (error) {
    console.error('Siparişler getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = ['bekliyor', 'onaylandı', 'hazırlanıyor', 'kargoda', 'tamamlandı', 'iptal'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(responseError('Geçersiz sipariş durumu'));
    }

    let updateQuery = 'UPDATE orders SET status = ?';
    let params = [status];

    if (trackingNumber) {
      updateQuery += ', tracking_number = ?';
      params.push(trackingNumber);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await db.run(updateQuery, params);

    await logAdminAction(db, req.user.id, 'UPDATE_ORDER', `Sipariş #${id} durumu: ${status}${trackingNumber ? ', Kargo no: ' + trackingNumber : ''}`, req);

    res.json(responseSuccess(null, 'Sipariş durumu güncellendi'));
  } catch (error) {
    console.error('Sipariş durumu güncelleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Ürün Yorumları Yönetimi
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await db.all(`
      SELECT pr.*, p.name as product_name
      FROM product_reviews pr
      LEFT JOIN products p ON pr.product_id = p.id
      ORDER BY pr.created_at DESC
    `);

    res.json(responseSuccess(reviews));
  } catch (error) {
    console.error('Yorumlar getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    await db.run('UPDATE product_reviews SET is_approved = 1 WHERE id = ?', [id]);

    res.json(responseSuccess(null, 'Yorum onaylandı'));
  } catch (error) {
    console.error('Yorum onaylama hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const addAdminReview = async (req, res) => {
  try {
    const { productId, authorName, comment, rating } = req.body;

    if (!productId || !authorName || !comment || !rating) {
      return res.status(400).json(responseError('Tüm alanlar gereklidir'));
    }

    await db.run(`
      INSERT INTO product_reviews (product_id, author_name, comment, rating, is_approved)
      VALUES (?, ?, ?, ?, 1)
    `, [productId, authorName, comment, rating]);

    res.json(responseSuccess(null, 'Admin yorumu eklendi'));
  } catch (error) {
    console.error('Admin yorumu ekleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin işlem logları
export const getAdminLogs = async (req, res) => {
  try {
    const logs = await db.all(`
      SELECT al.*, u.nickname as admin_nickname
      FROM admin_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    res.json(responseSuccess(logs));
  } catch (error) {
    console.error('Admin logları getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Ürünü öne çıkan yapar/kaldırır
export const toggleFeaturedProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Mevcut durumu kontrol et
    const product = await db.get('SELECT is_featured FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json(responseError('Ürün bulunamadı'));
    }

    const newFeaturedStatus = product.is_featured ? 0 : 1;

    // Güncelle
    await db.run(
      'UPDATE products SET is_featured = ? WHERE id = ?',
      [newFeaturedStatus, id]
    );

    // Admin log kaydet
    await logAdminAction(
      db,
      req.user.id,
      'TOGGLE_FEATURED_PRODUCT',
      `Ürün #${id} öne çıkan durumu: ${newFeaturedStatus ? 'Eklendi' : 'Kaldırıldı'}`,
      req
    );

    res.json(responseSuccess({
      message: `Ürün ${newFeaturedStatus ? 'öne çıkanlar listesine eklendi' : 'öne çıkanlar listesinden kaldırıldı'}`,
      is_featured: newFeaturedStatus
    }));

  } catch (error) {
    console.error('Öne çıkan ürün güncelleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};