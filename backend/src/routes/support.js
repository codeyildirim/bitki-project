import express from 'express';
import {
  getFAQs,
  incrementFAQView,
  getSupportTemplates,
  incrementTemplateUsage,
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getAllSupportTemplates,
  createSupportTemplate,
  updateSupportTemplate,
  deleteSupportTemplate
} from '../controllers/support.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/faqs', getFAQs);
router.post('/faqs/:id/view', incrementFAQView);
router.get('/templates', getSupportTemplates);
router.post('/templates/:id/use', incrementTemplateUsage);

// Admin routes - FAQ
router.get('/admin/faqs', authenticateToken, requireAdmin, getAllFAQs);
router.post('/admin/faqs', authenticateToken, requireAdmin, createFAQ);
router.put('/admin/faqs/:id', authenticateToken, requireAdmin, updateFAQ);
router.delete('/admin/faqs/:id', authenticateToken, requireAdmin, deleteFAQ);

// Admin routes - Support Templates
router.get('/admin/templates', authenticateToken, requireAdmin, getAllSupportTemplates);
router.post('/admin/templates', authenticateToken, requireAdmin, createSupportTemplate);
router.put('/admin/templates/:id', authenticateToken, requireAdmin, updateSupportTemplate);
router.delete('/admin/templates/:id', authenticateToken, requireAdmin, deleteSupportTemplate);

export default router;