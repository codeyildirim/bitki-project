import express from 'express';
import settingsController from '../controllers/settings.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Admin ayarları - sadece admin erişimi
router.get('/admin/settings', authenticateToken, requireAdmin, settingsController.getSettings);
router.post('/admin/settings', authenticateToken, requireAdmin, settingsController.saveSettings);

// Public ayarlar - herkese açık
router.get('/settings/public', settingsController.getPublicSettings);

export default router;