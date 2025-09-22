import express from 'express';
import {
  getBlogPosts, getBlogPost, addBlogComment,
  createBlogPost, updateBlogPost, deleteBlogPost,
  getBlogComments, approveBlogComment, getAdminBlogPosts
} from '../controllers/blog.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getBlogPosts);
router.get('/:id', getBlogPost);

// User routes
router.post('/:id/comments', authenticateToken, addBlogComment);

// Admin routes
router.get('/admin/posts', authenticateToken, requireAdmin, getAdminBlogPosts);
router.post('/admin/posts', authenticateToken, requireAdmin, createBlogPost);
router.put('/admin/posts/:id', authenticateToken, requireAdmin, updateBlogPost);
router.delete('/admin/posts/:id', authenticateToken, requireAdmin, deleteBlogPost);
router.get('/admin/comments', authenticateToken, requireAdmin, getBlogComments);
router.put('/admin/comments/:id/approve', authenticateToken, requireAdmin, approveBlogComment);

export default router;