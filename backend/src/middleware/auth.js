import { verifyJWT } from '../utils/crypto.js';
import { responseError } from '../utils/helpers.js';
import db from '../models/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(responseError('Giriş yapmanız gerekiyor', 401));
  }

  try {
    const decoded = verifyJWT(token);
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);

    if (!user) {
      return res.status(401).json(responseError('Geçersiz token', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json(responseError('Geçersiz token', 403));
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json(responseError('Admin yetkisi gerekiyor', 403));
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Token yoksa devam et, ama req.user = null olarak bırak
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyJWT(token);
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);

    if (user) {
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  } catch (err) {
    // Token geçersizse de devam et
    req.user = null;
    next();
  }
};

export const requireAdminRole = async (req, res, next) => {
  try {
    // Check if token has admin role
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json(responseError('Admin token gerekiyor', 401));
    }

    const decoded = verifyJWT(token);

    // Verify admin role in token
    if (decoded.role !== 'admin') {
      return res.status(403).json(responseError('Admin rolü gerekiyor', 403));
    }

    // Verify admin status in database
    const user = await db.get('SELECT * FROM users WHERE id = ? AND is_admin = 1', [decoded.userId]);
    if (!user) {
      return res.status(403).json(responseError('Admin yetkisi bulunamadı', 403));
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json(responseError('Geçersiz admin token', 403));
  }
};