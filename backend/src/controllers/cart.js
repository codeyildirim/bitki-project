import { responseSuccess, responseError } from '../utils/helpers.js';
import db from '../models/database.js';

export const getCart = async (req, res) => {
  try {
    if (!req.user?.id) {
      // Giriş yapmamış kullanıcılar için localStorage'den sepet bilgisi döner
      return res.json(responseSuccess([]));
    }

    const cartItems = await db.all(`
      SELECT c.*, p.name, p.description, p.price, p.stock, p.images, p.videos
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ? AND p.is_active = 1
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const formattedItems = cartItems.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images).map(img =>
        img.startsWith('http') ? img : `${baseURL}${img}`
      ) : [],
      videos: item.videos ? JSON.parse(item.videos).map(video =>
        video.startsWith('http') ? video : `${baseURL}${video}`
      ) : []
    }));

    res.json(responseSuccess(formattedItems));

  } catch (error) {
    console.error('Sepet getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json(responseError('Geçerli ürün ID ve miktar gereklidir'));
    }

    const product = await db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [productId]);
    if (!product) {
      return res.status(404).json(responseError('Ürün bulunamadı'));
    }

    if (product.stock < quantity) {
      return res.status(400).json(responseError('Yetersiz stok'));
    }

    // Mevcut sepet öğesini kontrol et
    const existingItem = await db.get(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json(responseError('Stok limiti aşıldı'));
      }

      await db.run(
        'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newQuantity, existingItem.id]
      );
    } else {
      await db.run(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, productId, quantity]
      );
    }

    res.json(responseSuccess(null, 'Ürün sepete eklendi'));

  } catch (error) {
    console.error('Sepete ekleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json(responseError('Geçerli miktar gereklidir'));
    }

    const cartItem = await db.get(
      'SELECT c.*, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ?',
      [id, req.user.id]
    );

    if (!cartItem) {
      return res.status(404).json(responseError('Sepet öğesi bulunamadı'));
    }

    if (cartItem.stock < quantity) {
      return res.status(400).json(responseError('Yetersiz stok'));
    }

    await db.run(
      'UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, id]
    );

    res.json(responseSuccess(null, 'Sepet güncellendi'));

  } catch (error) {
    console.error('Sepet güncelleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await db.get(
      'SELECT * FROM cart WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!cartItem) {
      return res.status(404).json(responseError('Sepet öğesi bulunamadı'));
    }

    await db.run('DELETE FROM cart WHERE id = ?', [id]);

    res.json(responseSuccess(null, 'Ürün sepetten kaldırıldı'));

  } catch (error) {
    console.error('Sepetten kaldırma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const clearCart = async (req, res) => {
  try {
    await db.run('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json(responseSuccess(null, 'Sepet temizlendi'));

  } catch (error) {
    console.error('Sepet temizleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};