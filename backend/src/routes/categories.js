import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../models/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getUploadPath } from '../utils/uploadPaths.js';

const router = express.Router();

// Uploads klasörünü oluştur
const uploadsDir = getUploadPath('categories');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'category-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece JPEG, PNG ve WebP dosyaları desteklenir'));
    }
  }
});

// Tüm kategorileri getir
router.get('/', async (req, res) => {
  try {
    const categories = await db.all(`
      SELECT c.*,
             p.name as parent_name,
             COUNT(DISTINCT pr.id) as product_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN products pr ON pr.category_id = c.id
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Kategori listesi hatası:', error);
    res.status(500).json({ success: false, message: 'Kategoriler yüklenirken hata oluştu' });
  }
});

// Kategori detayı
router.get('/:id', async (req, res) => {
  try {
    const category = await db.get(
      'SELECT * FROM categories WHERE id = ? AND is_active = 1',
      [req.params.id]
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
    }

    // Alt kategoriler
    const subcategories = await db.all(
      'SELECT * FROM categories WHERE parent_id = ? AND is_active = 1',
      [req.params.id]
    );

    // Kategorideki ürünler
    const products = await db.all(
      'SELECT * FROM products WHERE category_id = ? AND stock > 0',
      [req.params.id]
    );

    res.json({
      success: true,
      data: { ...category, subcategories, products }
    });
  } catch (error) {
    console.error('Kategori detay hatası:', error);
    res.status(500).json({ success: false, message: 'Kategori yüklenirken hata oluştu' });
  }
});

// Admin: Yeni kategori ekle
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  const { name, slug, description, image_url, parent_id } = req.body;

  if (!name || !slug) {
    return res.status(400).json({
      success: false,
      message: 'Kategori adı ve slug gereklidir'
    });
  }

  try {
    // Slug kontrolü
    const existingCategory = await db.get(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    );

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Bu slug zaten kullanılıyor'
      });
    }

    // Resim URL'ini belirle
    let finalImageUrl = image_url || '';
    if (req.file) {
      // Yüklenen dosyanın URL'ini oluştur
      finalImageUrl = `/uploads/categories/${req.file.filename}`;
    }

    const result = await db.run(
      `INSERT INTO categories (name, slug, description, image_url, parent_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, slug, description, finalImageUrl, parent_id]
    );

    const newCategory = await db.get(
      'SELECT * FROM categories WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      success: true,
      message: 'Kategori başarıyla eklendi',
      data: newCategory
    });
  } catch (error) {
    console.error('Kategori ekleme hatası:', error);
    res.status(500).json({ success: false, message: 'Kategori eklenirken hata oluştu' });
  }
});

// Admin: Kategori güncelle
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  const { name, slug, description, image_url, parent_id, is_active } = req.body;

  try {
    const category = await db.get(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
    }

    // Slug benzersizlik kontrolü
    if (slug && slug !== category.slug) {
      const existingCategory = await db.get(
        'SELECT id FROM categories WHERE slug = ? AND id != ?',
        [slug, req.params.id]
      );

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Bu slug zaten kullanılıyor'
        });
      }
    }

    // Resim URL'ini belirle
    let finalImageUrl = image_url || category.image_url;
    if (req.file) {
      // Eski dosyayı sil (eğer lokal dosya ise)
      if (category.image_url && category.image_url.startsWith('/uploads/')) {
        const oldFilePath = path.join(process.cwd(), category.image_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      // Yeni dosyanın URL'ini oluştur
      finalImageUrl = `/uploads/categories/${req.file.filename}`;
    }

    await db.run(
      `UPDATE categories
       SET name = ?, slug = ?, description = ?, image_url = ?,
           parent_id = ?, is_active = ?
       WHERE id = ?`,
      [
        name || category.name,
        slug || category.slug,
        description || category.description,
        finalImageUrl,
        parent_id !== undefined ? parent_id : category.parent_id,
        is_active !== undefined ? is_active : category.is_active,
        req.params.id
      ]
    );

    const updatedCategory = await db.get(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Kategori güncellendi',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Kategori güncellenirken hata oluştu' });
  }
});

// Admin: Kategori sil
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Alt kategorileri kontrol et
    const subcategories = await db.all(
      'SELECT id FROM categories WHERE parent_id = ?',
      [req.params.id]
    );

    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu kategorinin alt kategorileri var. Önce onları silin.'
      });
    }

    // Kategorideki ürünleri kontrol et
    const products = await db.all(
      'SELECT id FROM products WHERE category_id = ?',
      [req.params.id]
    );

    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu kategoride ürünler var. Önce ürünleri başka kategoriye taşıyın.'
      });
    }

    await db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Kategori silindi'
    });
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    res.status(500).json({ success: false, message: 'Kategori silinirken hata oluştu' });
  }
});

export default router;