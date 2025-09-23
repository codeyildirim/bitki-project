import express from 'express';
import multer from 'multer';
import fs from 'fs';
import db from '../models/database.js';
import {
  adminLogin,
  getUsers, deleteUser, resetUserPassword,
  getIPBans, addIPBan, removeIPBan,
  createProduct, updateProduct, deleteProduct,
  createCategory,
  getAllOrders, updateOrderStatus,
  getProductReviews, approveReview, addAdminReview,
  getAdminLogs, toggleFeaturedProduct
} from '../controllers/admin.js';
import { authenticateToken, requireAdmin, requireAdminRole } from '../middleware/auth.js';
import { sanitizeFilename, getMulterFileFilter, getMulterLimits } from '../utils/helpers.js';
import { getUploadPath } from '../utils/uploadPaths.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter specifically for admin login - Reduced for testing
const adminLoginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (reduced for testing)
  max: 100, // limit each IP to 100 requests per windowMs (increased for testing)
  message: {
    success: false,
    message: 'Çok fazla admin giriş denemesi. 1 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin login route (no CAPTCHA required, separate from customer login)
router.post('/login', adminLoginLimiter, adminLogin);

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on file type
    const isVideo = file.mimetype.startsWith('video/');
    const destination = isVideo ? getUploadPath('videos') : getUploadPath('products');

    // Ensure directory exists
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const sanitizedName = sanitizeFilename(file.originalname);
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const isVideo = file.mimetype.startsWith('video/');
    const prefix = isVideo ? 'video' : 'product';
    cb(null, `${prefix}_${timestamp}_${randomSuffix}_${sanitizedName}`);
  }
});

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/categories/');
  },
  filename: (req, file, cb) => {
    const sanitizedName = sanitizeFilename(file.originalname);
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    cb(null, `category_${timestamp}_${randomSuffix}_${sanitizedName}`);
  }
});

const productUpload = multer({
  storage: productStorage,
  fileFilter: getMulterFileFilter(),
  limits: getMulterLimits()
});

const categoryUpload = multer({
  storage: categoryStorage,
  fileFilter: getMulterFileFilter(),
  limits: getMulterLimits()
});

// Dashboard Endpoint
router.get('/dashboard', requireAdminRole, async (req, res) => {
  try {
    // Toplam kullanıcı sayısı
    const totalUsersResult = await db.get('SELECT COUNT(*) as count FROM users WHERE is_admin != 1');
    const totalUsers = totalUsersResult.count;

    // Toplam sipariş sayısı
    const totalOrdersResult = await db.get('SELECT COUNT(*) as count FROM orders');
    const totalOrders = totalOrdersResult.count;

    // Toplam ürün sayısı
    const totalProductsResult = await db.get('SELECT COUNT(*) as count FROM products');
    const totalProducts = totalProductsResult.count;

    // Toplam ciro
    const totalRevenueResult = await db.get('SELECT SUM(total_amount) as total FROM orders WHERE status = "delivered"');
    const totalRevenue = totalRevenueResult.total || 0;

    // Bekleyen siparişler
    const pendingOrdersResult = await db.get('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
    const pendingOrders = pendingOrdersResult.count;

    // Son siparişler
    const recentOrders = await db.all(`
      SELECT o.*, u.nickname as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        pendingOrders,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard verisi alma hatası:', error);
    res.status(500).json({ success: false, message: 'Dashboard verisi alınamadı' });
  }
});

// Kullanıcı Yönetimi
router.get('/users', requireAdminRole, getUsers);
router.delete('/users/:id', requireAdminRole, deleteUser);
router.put('/users/:id/reset-password', requireAdminRole, resetUserPassword);

// IP Ban Yönetimi
router.get('/ip-bans', requireAdminRole, getIPBans);
router.post('/ip-bans', requireAdminRole, addIPBan);
router.delete('/ip-bans/:id', requireAdminRole, removeIPBan);

// Ürün Yönetimi
router.post('/products', requireAdminRole, productUpload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 }
]), createProduct);
router.put('/products/:id', requireAdminRole, productUpload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 }
]), updateProduct);
router.delete('/products/:id', requireAdminRole, deleteProduct);
router.patch('/products/:id/featured', requireAdminRole, toggleFeaturedProduct);

// Kategori Yönetimi
router.post('/categories', requireAdminRole, categoryUpload.single('image'), createCategory);

// Sipariş Yönetimi
router.get('/orders', requireAdminRole, getAllOrders);
router.put('/orders/:id/status', requireAdminRole, updateOrderStatus);

// Yorum Yönetimi
router.get('/reviews', requireAdminRole, getProductReviews);
router.put('/reviews/:id/approve', requireAdminRole, approveReview);
router.post('/reviews', requireAdminRole, addAdminReview);

// Admin İşlem Logları
router.get('/logs', requireAdminRole, getAdminLogs);

export default router;