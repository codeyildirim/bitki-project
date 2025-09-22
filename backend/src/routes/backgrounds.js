import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getUploadPath } from '../utils/uploadPaths.js';
import {
  uploadBackground,
  deleteBackground,
  getBackgrounds,
  getPageBackgrounds
} from '../controllers/backgrounds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Dosya yükleme için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadPath('backgrounds');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `background-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Sadece desteklenen formatları kabul et
  if (ext === '.mp4' || ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece .mp4, .jpg, .png veya .webp dosyaları yüklenebilir'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Public route - no auth required
router.get('/page/:page', getPageBackgrounds);

// Admin only routes
router.post('/upload', authenticateToken, requireAdmin, upload.single('background'), uploadBackground);
router.post('/delete', authenticateToken, requireAdmin, deleteBackground);
router.get('/all', authenticateToken, requireAdmin, getBackgrounds);

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya çok büyük. Maksimum 100MB olmalıdır.'
      });
    }
  }

  if (error.message && error.message.includes('dosyaları yüklenebilir')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Dosya yükleme hatası'
  });
});

export default router;