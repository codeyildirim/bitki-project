import express from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCampaigns,
  createCampaign,
  updateCampaign,
  getActiveCampaigns
} from '../controllers/coupons.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/validate', authenticateToken, validateCoupon);
router.get('/campaigns/active', getActiveCampaigns);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getCoupons);
router.post('/', authenticateToken, requireAdmin, createCoupon);
router.put('/:id', authenticateToken, requireAdmin, updateCoupon);
router.delete('/:id', authenticateToken, requireAdmin, deleteCoupon);

router.get('/campaigns', authenticateToken, requireAdmin, getCampaigns);
router.post('/campaigns', authenticateToken, requireAdmin, createCampaign);
router.put('/campaigns/:id', authenticateToken, requireAdmin, updateCampaign);

export default router;