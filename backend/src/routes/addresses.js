import express from 'express';
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/addresses.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/addresses - Kullanıcının adreslerini getir
router.get('/', authenticateToken, getUserAddresses);

// POST /api/addresses - Yeni adres oluştur
router.post('/', authenticateToken, createAddress);

// PUT /api/addresses/:id - Adresi güncelle
router.put('/:id', authenticateToken, updateAddress);

// DELETE /api/addresses/:id - Adresi sil
router.delete('/:id', authenticateToken, deleteAddress);

// PATCH /api/addresses/:id/default - Adresi varsayılan yap
router.patch('/:id/default', authenticateToken, setDefaultAddress);

export default router;