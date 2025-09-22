import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';
import { uploadBackground, deleteBackground, listBackgrounds } from '../controllers/backgroundUpload.js';

const router = express.Router();

// Admin korumalı route'lar
// Upload route - multer middleware controller içinde yapılıyor
router.post('/upload', authenticateToken, requireAdmin, uploadBackground);
router.post('/delete', authenticateToken, requireAdmin, deleteBackground);
router.get('/list', authenticateToken, requireAdmin, listBackgrounds);

export default router;