import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ HATA: JWT_SECRET environment değişkeni tanımlanmamış!');
  console.error('Lütfen .env dosyanızda JWT_SECRET tanımlayın.');
  process.exit(1);
}

// Routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import blogRoutes from './routes/blog.js';
import captchaRoutes from './routes/captcha.js';
import cartRoutes from './routes/cart.js';
import addressRoutes from './routes/addresses.js';
import healthRoutes from './routes/health.js';

// Middleware
import { checkIPBan } from './middleware/ipban.js';

// Database initialization
import './models/database.js';
import { runMigrations } from './utils/migrations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy ayarı (IP adresini doğru almak için)
// Rate limiting için güvenli proxy ayarı - Render/Proxy arkasında güvenli işlem için
app.set('trust proxy', 1);

// CORS configuration MUST come FIRST - PRODUCTION ONLY, NO LOCALHOST!
app.use(cors({
  origin: [
    'https://bitki-project.vercel.app',
    'https://bitki-admin.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting - Farklı endpoint'ler için farklı limitler
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // Her IP için maksimum 5 istek
  message: { success: false, message: 'Çok fazla giriş denemesi, lütfen daha sonra tekrar deneyin' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip, // IP bazlı rate limiting
});

const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 dakika
  max: 100, // Her IP için maksimum 100 istek
  message: { success: false, message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin' },
  keyGenerator: (req) => req.ip, // IP bazlı rate limiting
});

const captchaLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 30, // Her IP için maksimum 30 istek
  message: { success: false, message: 'CAPTCHA istekleri için çok fazla istek gönderdiniz' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

// Global rate limiter - tüm istekler için
const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 dakika
  max: 300, // Her IP için maksimum 300 istek
  message: { success: false, message: 'Çok fazla istek gönderdiniz, lütfen biraz bekleyin' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

// Apply rate limiters to specific routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/recover-password', authLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/captcha', captchaLimiter);
app.use('/api', generalLimiter);

// Global rate limiter - tüm isteklere uygulanır
app.use(globalLimiter);

// Body parsing middleware - 1MB limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// IP ban kontrolü
app.use(checkIPBan);

// Static files (uploads) - Render kalıcı disk için
const UPLOAD_DIR = process.env.UPLOAD_DIR || (process.env.NODE_ENV === 'production' ? '/opt/render/project/uploads' : './uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Create subdirectories
const subDirs = ['products', 'videos', 'categories', 'temp', 'backgrounds'];
subDirs.forEach(subDir => {
  const fullPath = join(UPLOAD_DIR, subDir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

app.use('/uploads', express.static(UPLOAD_DIR, { fallthrough: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/captcha', captchaRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/health', healthRoutes);

// Yeni route'lar
import categoriesRoutes from './routes/categories.js';
import paymentRoutes from './routes/payment.js';
import couponsRoutes from './routes/coupons.js';
import pwaRoutes from './routes/pwa.js';
import supportRoutes from './routes/support.js';
import mediaRoutes from './routes/media.js';
import backgroundsRoutes from './routes/backgrounds.js';
import backgroundUploadRoutes from './routes/backgroundUpload.js';

app.use('/api/categories', categoriesRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/pwa', pwaRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/backgrounds', backgroundsRoutes);
app.use('/api/admin/background', backgroundUploadRoutes);

// Settings routes
import settingsRoutes from './routes/settings.js';
app.use('/api', settingsRoutes);

// Setup routes (TEK SEFERLİK KULLANIM İÇİN!)
import setupRoutes from './routes/setup.js';
app.use('/api/setup', setupRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Şifalı Bitkiler API çalışıyor', timestamp: new Date().toISOString() });
});

// Turkey cities endpoint
app.get('/api/cities', (req, res) => {
  try {
    const citiesPath = join(__dirname, '../data/turkey-cities.json');
    const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
    res.json({ success: true, data: citiesData.cities });
  } catch (error) {
    console.error('Şehir verileri getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Şehir verileri alınamadı' });
  }
});

// Blockchain/Crypto endpoints
app.get('/api/crypto/addresses', (req, res) => {
  const addresses = {
    bitcoin: process.env.BTC_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ethereum: process.env.ETH_ADDRESS || '0x742d35Cc6634C0532925a3b8D5c84a9999998Eb2',
    bnb: process.env.BNB_ADDRESS || '0x742d35Cc6634C0532925a3b8D5c84a9999998Eb2'
  };
  res.json({ success: true, data: addresses });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err);

  if (err.message.includes('CORS')) {
    return res.status(403).json({ success: false, message: 'CORS hatası' });
  }

  if (err.message.includes('Multer')) {
    return res.status(400).json({ success: false, message: 'Dosya yükleme hatası: ' + err.message });
  }

  res.status(500).json({ success: false, message: 'Sunucu hatası oluştu' });
});

// 404 handler with debug logging
app.use('*', (req, res) => {
  console.warn('⚠️ [404 DEBUG]', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  res.status(404).json({ success: false, message: 'Endpoint bulunamadı' });
});

app.listen(PORT, async () => {
  console.log(`🌿 Şifalı Bitkiler E-Ticaret API çalışıyor: https://bitki-project.onrender.com`);
  console.log(`📋 Health Check: https://bitki-project.onrender.com/api/health`);
  console.log(`🗃️  Database: SQLite (${join(__dirname, '../database.sqlite')})`);

  // Run database migrations
  try {
    await runMigrations();
  } catch (error) {
    console.error('❌ Migration failed, but server will continue running:', error);
  }
});

export default app;