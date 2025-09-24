import express from 'express';
import {
  getBlogPosts, getBlogPost, addBlogComment,
  createBlogPost, updateBlogPost, deleteBlogPost,
  getBlogComments, approveBlogComment, getAdminBlogPosts
} from '../controllers/blog.js';
import { authenticateToken, requireAdminRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getBlogPosts);
router.get('/:id', getBlogPost);

// User routes
router.post('/:id/comments', authenticateToken, addBlogComment);

// Admin routes
router.get('/admin/posts', requireAdminRole, getAdminBlogPosts);
router.post('/admin/posts', requireAdminRole, createBlogPost);
router.put('/admin/posts/:id', requireAdminRole, updateBlogPost);
router.delete('/admin/posts/:id', requireAdminRole, deleteBlogPost);
router.get('/admin/comments', requireAdminRole, getBlogComments);
router.put('/admin/comments/:id/approve', requireAdminRole, approveBlogComment);

export default router;