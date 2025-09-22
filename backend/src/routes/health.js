import express from 'express';

const router = express.Router();

// Sağlık kontrolü için basit endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API çalışıyor 🚀',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Detaylı sistem bilgisi endpoint'i
router.get('/detailed', (req, res) => {
  res.json({
    success: true,
    message: 'Bitki Backend API - Detaylı Sistem Bilgisi',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
    },
    database: 'SQLite',
    uploadDir: process.env.UPLOAD_DIR || 'default'
  });
});

export default router;