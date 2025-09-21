import { responseSuccess, responseError } from '../utils/helpers.js';
import crypto from 'crypto';
import db from '../models/database.js';

// Cleanup expired captchas every 5 minutes
setInterval(async () => {
  try {
    await db.run('DELETE FROM captcha_sessions WHERE expires_at < datetime("now")');
  } catch (error) {
    console.error('CAPTCHA cleanup error:', error);
  }
}, 5 * 60 * 1000);

const generateBrokenCircleCaptcha = () => {
  const numCircles = Math.floor(Math.random() * 3) + 5; // 5-7 circles
  const circles = [];
  const brokenCircleIndex = Math.floor(Math.random() * numCircles);

  // Generate grid positions to avoid overlap
  const positions = [];
  const cols = 3;
  const rows = 3;
  const cellWidth = 100;
  const cellHeight = 60;
  const startX = 30;
  const startY = 30;

  // Create position pool
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push({
        x: startX + col * cellWidth + Math.random() * 40 - 20,
        y: startY + row * cellHeight + Math.random() * 30 - 15
      });
    }
  }

  // Shuffle positions and pick required number
  positions.sort(() => Math.random() - 0.5);
  const selectedPositions = positions.slice(0, numCircles);

  for (let i = 0; i < numCircles; i++) {
    circles.push({
      id: i,
      x: Math.round(selectedPositions[i].x),
      y: Math.round(selectedPositions[i].y),
      isBroken: i === brokenCircleIndex,
      // Rotation for the broken circle gap position
      gapRotation: i === brokenCircleIndex ? Math.floor(Math.random() * 360) : 0,
      radius: 22 + Math.random() * 6 // Slight size variation
    });
  }

  return { circles, brokenCircleIndex };
};

// Generate new CAPTCHA
export const createCaptcha = async (req, res) => {
  try {
    const captchaId = crypto.randomBytes(16).toString('hex');
    const { circles, brokenCircleIndex } = generateBrokenCircleCaptcha();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    // Store captcha data in database
    await db.run(`
      INSERT INTO captcha_sessions (id, solution_index, expires_at, ip)
      VALUES (?, ?, ?, ?)
    `, [captchaId, brokenCircleIndex, expiresAt.toISOString(), clientIp]);

    // Send circles to frontend (without revealing which one is correct)
    res.json(responseSuccess({
      captchaId,
      circles: circles.map(c => ({
        id: c.id,
        x: c.x,
        y: c.y,
        isBroken: c.isBroken,
        gapRotation: c.gapRotation,
        radius: c.radius
      }))
    }));

  } catch (error) {
    console.error('CAPTCHA creation error:', error);
    res.status(500).json(responseError('CAPTCHA oluşturulamadı'));
  }
};

// Verify CAPTCHA selection
export const verifyCaptcha = async (req, res) => {
  try {
    const { captchaId, selectedIndex } = req.body;

    if (!captchaId || selectedIndex === undefined) {
      return res.status(400).json(responseError('CAPTCHA ID ve seçim gereklidir'));
    }

    // Get captcha from database
    const captcha = await db.get(`
      SELECT * FROM captcha_sessions
      WHERE id = ? AND expires_at > datetime("now")
    `, [captchaId]);

    if (!captcha) {
      return res.status(400).json(responseError('Geçersiz veya süresi dolmuş CAPTCHA'));
    }

    // Increment attempts
    const newAttempts = captcha.attempts + 1;
    await db.run(`
      UPDATE captcha_sessions
      SET attempts = ?
      WHERE id = ?
    `, [newAttempts, captchaId]);

    // Check if too many attempts
    if (newAttempts > 3) {
      await db.run('DELETE FROM captcha_sessions WHERE id = ?', [captchaId]);
      return res.status(400).json(responseError('Çok fazla yanlış deneme. Yeni CAPTCHA alın.'));
    }

    // Check if already verified
    if (captcha.verified) {
      return res.status(400).json(responseError('Bu CAPTCHA zaten doğrulanmış'));
    }

    // Verify selection
    const isCorrect = selectedIndex === captcha.solution_index;

    if (isCorrect) {
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verifiedAt = new Date().toISOString();

      // Update captcha as verified
      await db.run(`
        UPDATE captcha_sessions
        SET verified = 1, verification_token = ?, verified_at = ?
        WHERE id = ?
      `, [verificationToken, verifiedAt, captchaId]);

      res.json(responseSuccess({
        verified: true,
        token: verificationToken
      }, 'CAPTCHA başarıyla doğrulandı'));
    } else {
      res.status(400).json(responseError(`Yanlış seçim. ${3 - newAttempts} deneme hakkınız kaldı.`));
    }

  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    res.status(500).json(responseError('CAPTCHA doğrulanamadı'));
  }
};

// Middleware to validate CAPTCHA token in auth endpoints
export const validateCaptchaToken = async (req, res, next) => {
  try {
    const { captchaToken } = req.body;

    if (!captchaToken) {
      return res.status(401).json(responseError('CAPTCHA doğrulaması gereklidir'));
    }

    // Find captcha by verification token
    const validCaptcha = await db.get(`
      SELECT * FROM captcha_sessions
      WHERE verification_token = ? AND verified = 1
    `, [captchaToken]);

    if (!validCaptcha) {
      return res.status(401).json(responseError('CAPTCHA failed - Geçersiz CAPTCHA token'));
    }

    // Check if token is not too old (5 minutes max for auth)
    const verifiedAt = new Date(validCaptcha.verified_at);
    const tokenAge = Date.now() - verifiedAt.getTime();

    if (tokenAge > 5 * 60 * 1000) {
      await db.run('DELETE FROM captcha_sessions WHERE id = ?', [validCaptcha.id]);
      return res.status(401).json(responseError('CAPTCHA token süresi dolmuş'));
    }

    // Delete token after successful use to prevent reuse
    await db.run('DELETE FROM captcha_sessions WHERE id = ?', [validCaptcha.id]);

    next();
  } catch (error) {
    console.error('CAPTCHA validation error:', error);
    return res.status(500).json(responseError('CAPTCHA doğrulama hatası'));
  }
};

// Admin endpoint to get CAPTCHA stats
export const getCaptchaStats = async (req, res) => {
  try {
    const totalCount = await db.get('SELECT COUNT(*) as count FROM captcha_sessions');
    const verifiedCount = await db.get('SELECT COUNT(*) as count FROM captcha_sessions WHERE verified = 1');
    const expiredCount = await db.get('SELECT COUNT(*) as count FROM captcha_sessions WHERE expires_at < datetime("now")');

    const stats = {
      activeCaptchas: totalCount.count,
      verifiedCount: verifiedCount.count,
      expiredCount: expiredCount.count,
      uptime: process.uptime()
    };

    res.json(responseSuccess(stats));
  } catch (error) {
    console.error('CAPTCHA stats error:', error);
    res.status(500).json(responseError('İstatistikler alınamadı'));
  }
};