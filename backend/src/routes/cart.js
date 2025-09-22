import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/cart - Sepeti getir (optional auth: hem giriş yapmış hem yapmamış kullanıcılar için)
router.get('/', optionalAuth, getCart);

// POST /api/cart - Sepete ürün ekle (auth required)
router.post('/', authenticateToken, addToCart);

// PUT /api/cart/:id - Sepet öğesini güncelle (auth required)
router.put('/:id', authenticateToken, updateCartItem);

// DELETE /api/cart/:id - Sepetten ürün kaldır (auth required)
router.delete('/:id', authenticateToken, removeFromCart);

// DELETE /api/cart - Sepeti temizle (auth required)
router.delete('/', authenticateToken, clearCart);

export default router;