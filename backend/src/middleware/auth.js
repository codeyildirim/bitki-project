import { verifyJWT } from '../utils/crypto.js';
import { responseError } from '../utils/helpers.js';
import db from '../models/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 [AUTH] Request to:', req.method, req.path);
  console.log('🔐 [AUTH] Authorization header:', authHeader ? `Bearer ${token?.substring(0, 20)}...` : 'Missing');

  if (!token) {
    console.log('❌ [AUTH] No token provided');
    return res.status(401).json(responseError('Giriş yapmanız gerekiyor', 401));
  }

  try {
    const decoded = verifyJWT(token);
    console.log('✅ [AUTH] Token decoded:', { userId: decoded.userId, role: decoded.role });

    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);

    if (!user) {
      console.log('❌ [AUTH] User not found in database:', decoded.userId);
      return res.status(401).json(responseError('Geçersiz token', 401));
    }

    console.log('✅ [AUTH] User authenticated:', { id: user.id, nickname: user.nickname, isAdmin: user.is_admin });
    req.user = user;
    next();
  } catch (err) {
    console.log('❌ [AUTH] Token verification failed:', err.message);
    return res.status(403).json(responseError('Geçersiz token', 403));
  }
};

export const requireAdmin = (req, res, next) => {
  console.log('👮 [ADMIN] Checking admin access for user:', {
    userId: req.user?.id,
    isAdmin: req.user?.is_admin
  });

  if (!req.user || !req.user.is_admin) {
    console.log('❌ [ADMIN] Access denied: Not an admin');
    return res.status(403).json(responseError('Admin yetkisi gerekiyor', 403));
  }

  console.log('✅ [ADMIN] Admin access granted');
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