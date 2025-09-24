import express from 'express';
import { register, login, recoverPassword, getProfile, updateProfile, checkNickname } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCaptchaToken } from '../controllers/captcha.js';

const router = express.Router();

// Nickname availability check (no auth required)
router.post('/check-nickname', checkNickname);

// Auth routes with CAPTCHA validation
router.post('/register', validateCaptchaToken, register);
router.post('/login', validateCaptchaToken, login);
router.post('/recover-password', recoverPassword);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;