import express from 'express';
import {
  trackPWAEvent,
  getPWAStats,
  subscribePush,
  unsubscribePush,
  sendPushNotification,
  getNotifications,
  deleteNotification,
  getPushFailures,
  getPWAAnalytics
} from '../controllers/pwa.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/track', trackPWAEvent);
router.post('/subscribe', subscribePush);
router.post('/unsubscribe', unsubscribePush);

// Admin routes
router.get('/stats', authenticateToken, requireAdmin, getPWAStats);
router.get('/analytics', authenticateToken, requireAdmin, getPWAAnalytics);
router.get('/notifications', authenticateToken, requireAdmin, getNotifications);
router.get('/failures', authenticateToken, requireAdmin, getPushFailures);
router.post('/notifications/send', authenticateToken, requireAdmin, sendPushNotification);
router.delete('/notifications/:id', authenticateToken, requireAdmin, deleteNotification);

export default router;