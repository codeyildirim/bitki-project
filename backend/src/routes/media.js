import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getUploadPath } from '../utils/uploadPaths.js';
import {
  uploadBackgroundVideo,
  getCurrentVideo,
  generateVideoThumbnail
} from '../controllers/media.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Video yükleme için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadPath('temp');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `background-video-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Sadece video dosyalarını kabul et
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece video dosyaları yüklenebilir'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Tüm media route'ları için admin auth gerekli
router.use(authenticateToken, requireAdmin);

// Arka plan video yükleme
router.post('/background-video', upload.single('video'), uploadBackgroundVideo);

// Mevcut video bilgisini getir
router.get('/background-video', getCurrentVideo);

// Video thumbnail oluştur (gelişmiş özellik)
router.post('/background-video/thumbnail', generateVideoThumbnail);

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Video dosyası çok büyük. Maksimum 50MB olmalıdır.'
      });
    }
  }

  if (error.message === 'Sadece video dosyaları yüklenebilir') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Video yükleme hatası'
  });
});

export default router;