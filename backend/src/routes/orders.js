import express from 'express';
import multer from 'multer';
import { createOrder, uploadPaymentProof, getUserOrders, getOrder } from '../controllers/orders.js';
import { authenticateToken } from '../middleware/auth.js';
import { sanitizeFilename, isImageFile } from '../utils/helpers.js';
import { getUploadPath } from '../utils/uploadPaths.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadPath());
  },
  filename: (req, file, cb) => {
    const sanitizedName = sanitizeFilename(file.originalname);
    cb(null, `payment_${Date.now()}_${sanitizedName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (isImageFile(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post('/', authenticateToken, createOrder);
router.post('/:orderId/payment-proof', authenticateToken, upload.single('paymentProof'), uploadPaymentProof);
router.get('/', authenticateToken, getUserOrders);
router.get('/:id', authenticateToken, getOrder);

export default router;