import express from 'express';
import { createCaptcha, verifyCaptcha, getCaptchaStats } from '../controllers/captcha.js';

const router = express.Router();

// Generate new CAPTCHA
router.get('/new', createCaptcha);

// Verify CAPTCHA selection
router.post('/verify', verifyCaptcha);

// Get CAPTCHA stats (for admin/debugging)
router.get('/stats', getCaptchaStats);

export default router;