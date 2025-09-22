import express from 'express';
import {
  trackPWAEvent,
  getPWAStats,
  subscribePush,
  unsubscribePush,
  sendPushNotification,
  getNotifications,
  deleteNotification
} from '../controllers/pwa.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/track', trackPWAEvent);
router.post('/subscribe', subscribePush);
router.post('/unsubscribe', unsubscribePush);

// Admin routes
router.get('/stats', authenticateToken, requireAdmin, getPWAStats);
router.get('/notifications', authenticateToken, requireAdmin, getNotifications);
router.post('/notifications/send', authenticateToken, requireAdmin, sendPushNotification);
router.delete('/notifications/:id', authenticateToken, requireAdmin, deleteNotification);

export default router;