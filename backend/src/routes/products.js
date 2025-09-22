import express from 'express';
import { getProducts, getProduct, getCategories, addProductReview, getFeaturedProducts } from '../controllers/products.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
router.post('/:id/reviews', authenticateToken, addProductReview);

export default router;