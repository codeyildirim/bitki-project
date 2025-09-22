import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const responseSuccess = (data, message = 'Başarılı') => {
  return { success: true, message, data };
};

export const responseError = (message = 'Hata oluştu', statusCode = 400) => {
  return { success: false, message, statusCode };
};

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price);
};

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SB${timestamp.slice(-8)}${random}`;
};

export const checkIPInCIDR = (ip, cidr) => {
  if (!cidr.includes('/')) {
    return ip === cidr;
  }

  const [subnet, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - bits) - 1);

  const ipInt = ip.split('.').reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0) >>> 0;
  const subnetInt = subnet.split('.').reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0) >>> 0;

  return (ipInt & mask) === (subnetInt & mask);
};

export const getClientIP = (req) => {
  // X-Forwarded-For header'ından ilk IP'yi al (proxy arkasındaysa)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  // Diğer olası header'lar
  const xRealIP = req.headers['x-real-ip'];
  if (xRealIP) {
    return xRealIP;
  }

  // Express'in belirlediği IP
  if (req.ip) {
    return req.ip === '::1' ? '127.0.0.1' : req.ip;
  }

  // Socket'ten IP al
  const socketIP = req.connection?.remoteAddress ||
                   req.socket?.remoteAddress ||
                   req.connection?.socket?.remoteAddress;

  if (socketIP) {
    return socketIP === '::1' ? '127.0.0.1' : socketIP;
  }

  return '127.0.0.1'; // Fallback
};

export const validateTurkishPhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^(90)?5[0-9]{9}$/.test(cleanPhone);
};

export const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

export const isVideoFile = (filename) => {
  const videoExtensions = ['mp4', 'webm'];
  return videoExtensions.includes(getFileExtension(filename));
};

export const isAllowedFile = (filename) => {
  return isImageFile(filename) || isVideoFile(filename);
};

export const getMulterFileFilter = () => {
  return (req, file, cb) => {
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'video/mp4',
      'video/webm'
    ];

    if (allowedMimeTypes.includes(file.mimetype) && isAllowedFile(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece PNG, JPEG, WEBP resimleri ve MP4, WEBM videoları yüklenebilir'), false);
    }
  };
};

export const getMulterLimits = () => {
  return {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 10, // maksimum 10 dosya
    fields: 20 // maksimum 20 alan
  };
};

export const logAdminAction = async (db, adminId, action, details, req) => {
  try {
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';

    await db.run(
      `INSERT INTO admin_logs (admin_id, action, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [adminId, action, details, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Admin log kaydı hatası:', error);
  }
};

export const generateRecoveryCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REC_';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '_';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

