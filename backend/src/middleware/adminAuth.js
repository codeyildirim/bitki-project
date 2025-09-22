import { responseError } from '../utils/helpers.js';

// Admin yetki kontrolü middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json(responseError('Admin yetkisi gerekiyor', 403));
  }
  next();
};

export default requireAdmin;