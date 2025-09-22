import { responseSuccess, responseError } from '../utils/helpers.js';
import db from '../models/database.js';

export const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name,
      (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
      (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;

    const params = [];

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const products = await db.all(query, params);

    const countQuery = `
      SELECT COUNT(*) as total FROM products p
      WHERE p.is_active = 1
      ${category ? ' AND p.category_id = ?' : ''}
      ${search ? ' AND (p.name LIKE ? OR p.description LIKE ?)' : ''}
    `;

    const countParams = [];
    if (category) countParams.push(category);
    if (search) countParams.push(`%${search}%`, `%${search}%`);

    const { total } = await db.get(countQuery, countParams);

    const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images).map(img => {
        // Eğer URL zaten tam ise olduğu gibi dön, değilse baseURL ekle
        return img.startsWith('http') ? img : `${baseURL}${img}`;
      }) : [],
      videos: product.videos ? JSON.parse(product.videos).map(video => {
        // Eğer URL zaten tam ise olduğu gibi dön, değilse baseURL ekle
        return video.startsWith('http') ? video : `${baseURL}${video}`;
      }) : [],
      avg_rating: product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : 0,
      review_count: product.review_count || 0
    }));

    res.json(responseSuccess({
      products: formattedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }));

  } catch (error) {
    console.error('Ürünler getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.get(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = 1
    `, [id]);

    if (!product) {
      return res.status(404).json(responseError('Ürün bulunamadı'));
    }

    const reviews = await db.all(`
      SELECT * FROM product_reviews
      WHERE product_id = ? AND is_approved = 1
      ORDER BY created_at DESC
    `, [id]);

    const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images).map(img => {
        return img.startsWith('http') ? img : `${baseURL}${img}`;
      }) : [],
      videos: product.videos ? JSON.parse(product.videos).map(video => {
        return video.startsWith('http') ? video : `${baseURL}${video}`;
      }) : [],
      reviews
    };

    res.json(responseSuccess(formattedProduct));

  } catch (error) {
    console.error('Ürün getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await db.all('SELECT * FROM categories ORDER BY name');
    res.json(responseSuccess(categories));
  } catch (error) {
    console.error('Kategoriler getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const addProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, rating } = req.body;

    if (!comment || !rating || rating < 1 || rating > 5) {
      return res.status(400).json(responseError('Geçerli yorum ve puan (1-5) gereklidir'));
    }

    const product = await db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [id]);
    if (!product) {
      return res.status(404).json(responseError('Ürün bulunamadı'));
    }

    await db.run(`
      INSERT INTO product_reviews (product_id, author_name, comment, rating, is_approved)
      VALUES (?, ?, ?, ?, 0)
    `, [id, req.user.nickname, comment, rating]);

    res.json(responseSuccess(null, 'Yorumunuz incelenmek üzere gönderildi'));

  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await db.all(`
      SELECT p.*, c.name as category_name,
      (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
      (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.is_featured = 1
      ORDER BY p.created_at DESC
      LIMIT 8
    `);

    const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images).map(img => {
        return img.startsWith('http') ? img : `${baseURL}${img}`;
      }) : [],
      avg_rating: product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : 0
    }));

    res.json(responseSuccess(formattedProducts));

  } catch (error) {
    console.error('Öne çıkan ürünler getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};