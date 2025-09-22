import { responseError, getClientIP, checkIPInCIDR } from '../utils/helpers.js';
import db from '../models/database.js';

export const checkIPBan = async (req, res, next) => {
  try {
    const clientIP = getClientIP(req);
    const bannedIPs = await db.all('SELECT * FROM ip_bans');

    for (const ban of bannedIPs) {
      if (ban.is_cidr) {
        if (checkIPInCIDR(clientIP, ban.ip_address)) {
          return res.status(403).json(responseError('Erişim engellenmiştir', 403));
        }
      } else {
        if (clientIP === ban.ip_address) {
          return res.status(403).json(responseError('Erişim engellenmiştir', 403));
        }
      }
    }

    next();
  } catch (error) {
    console.error('IP ban kontrolü hatası:', error);
    next();
  }
};