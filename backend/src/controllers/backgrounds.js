import { responseSuccess, responseError, logAdminAction } from '../utils/helpers.js';
import db from '../models/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Promisified database methods
const dbRun = promisify(db.db.run.bind(db.db));
const dbAll = promisify(db.db.all.bind(db.db));

// Arka plan yükleme
export const uploadBackground = async (req, res) => {
  try {
    const { page, deviceType, fileType } = req.body;

    if (!req.file) {
      return res.status(400).json(responseError('Dosya gereklidir'));
    }

    if (!['home', 'products', 'blog'].includes(page)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json(responseError('Geçersiz sayfa'));
    }

    if (!['mobile', 'desktop'].includes(deviceType)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json(responseError('Geçersiz cihaz tipi'));
    }

    // Dosya uzantısını kontrol et
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let actualFileType;

    if (fileExtension === '.mp4') {
      actualFileType = 'video';
    } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(fileExtension)) {
      actualFileType = 'image';
    } else {
      fs.unlinkSync(req.file.path);
      return res.status(400).json(responseError('Desteklenmeyen dosya formatı'));
    }

    // Frontend backgrounds klasör yolu
    const backgroundsDir = path.join(__dirname, '../../../frontend/public/backgrounds');
    const fileName = `${page}-${deviceType}${fileExtension}`;
    const targetPath = path.join(backgroundsDir, fileName);

    // Backgrounds klasörü yoksa oluştur
    if (!fs.existsSync(backgroundsDir)) {
      fs.mkdirSync(backgroundsDir, { recursive: true });
    }

    // Eski dosyaları temizle (aynı page-deviceType kombinasyonu için)
    const existingFiles = fs.readdirSync(backgroundsDir);
    existingFiles.forEach(file => {
      if (file.startsWith(`${page}-${deviceType}`)) {
        fs.unlinkSync(path.join(backgroundsDir, file));
      }
    });

    // Yeni dosyayı hedef konuma taşı
    fs.renameSync(req.file.path, targetPath);

    // Veritabanını güncelle
    await dbRun(`
      INSERT INTO page_backgrounds (page, device_type, file_type, file_path, file_name, file_size, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(page, device_type, file_type)
      DO UPDATE SET
        file_path = excluded.file_path,
        file_name = excluded.file_name,
        file_size = excluded.file_size,
        uploaded_by = excluded.uploaded_by,
        updated_at = CURRENT_TIMESTAMP
    `, [
      page,
      deviceType,
      actualFileType,
      `/backgrounds/${fileName}`,
      req.file.originalname,
      req.file.size,
      req.user.id
    ]);

    // Admin log kaydet
    await logAdminAction(
      db,
      req.user.id,
      'UPLOAD_BACKGROUND',
      `Arka plan yüklendi: ${page} - ${deviceType} - ${actualFileType}`,
      req
    );

    res.json(responseSuccess({
      message: 'Arka plan başarıyla yüklendi',
      filePath: `/backgrounds/${fileName}`,
      page,
      deviceType,
      fileType: actualFileType
    }));

  } catch (error) {
    console.error('Arka plan yükleme hatası:', error);

    // Hata durumunda geçici dosyayı temizle
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json(responseError('Arka plan yükleme işlemi başarısız'));
  }
};

// Arka plan silme
export const deleteBackground = async (req, res) => {
  try {
    const { page, deviceType, fileType } = req.body;

    if (!['home', 'products', 'blog'].includes(page)) {
      return res.status(400).json(responseError('Geçersiz sayfa'));
    }

    if (!['mobile', 'desktop'].includes(deviceType)) {
      return res.status(400).json(responseError('Geçersiz cihaz tipi'));
    }

    if (!['video', 'image'].includes(fileType)) {
      return res.status(400).json(responseError('Geçersiz dosya tipi'));
    }

    const backgroundsDir = path.join(__dirname, '../../../frontend/public/backgrounds');

    // Dosyayı bul ve sil
    const existingFiles = fs.readdirSync(backgroundsDir);
    let deletedFile = null;

    existingFiles.forEach(file => {
      if (file.startsWith(`${page}-${deviceType}`)) {
        const filePath = path.join(backgroundsDir, file);
        const ext = path.extname(file).toLowerCase();

        if ((fileType === 'video' && ext === '.mp4') ||
            (fileType === 'image' && ['.jpg', '.jpeg', '.png', '.webp'].includes(ext))) {
          fs.unlinkSync(filePath);
          deletedFile = file;
        }
      }
    });

    if (!deletedFile) {
      return res.status(404).json(responseError('Silinecek dosya bulunamadı'));
    }

    const db = req.db || req.app.locals.db;

    // Veritabanından sil
    await dbRun(`
      DELETE FROM page_backgrounds
      WHERE page = ? AND device_type = ? AND file_type = ?
    `, [page, deviceType, fileType]);

    // Admin log kaydet
    await logAdminAction(
      db,
      req.user.id,
      'DELETE_BACKGROUND',
      `Arka plan silindi: ${page} - ${deviceType} - ${fileType}`,
      req
    );

    res.json(responseSuccess({
      message: 'Arka plan başarıyla silindi',
      page,
      deviceType,
      fileType
    }));

  } catch (error) {
    console.error('Arka plan silme hatası:', error);
    res.status(500).json(responseError('Arka plan silme işlemi başarısız'));
  }
};

// Mevcut arka planları getir
export const getBackgrounds = async (req, res) => {
  try {
    const db = req.db || req.app.locals.db;

    const backgrounds = await dbAll(`
      SELECT page, device_type, file_type, file_path, file_name, file_size,
             created_at, updated_at
      FROM page_backgrounds
      ORDER BY page, device_type, file_type
    `);

    // Dosya varlığını kontrol et
    const backgroundsDir = path.join(__dirname, '../../../frontend/public/backgrounds');
    const enrichedBackgrounds = backgrounds.map(bg => {
      const fullPath = path.join(__dirname, '../../../frontend/public', bg.file_path);
      const exists = fs.existsSync(fullPath);

      return {
        ...bg,
        exists,
        url: exists ? bg.file_path : null
      };
    });

    res.json(responseSuccess(enrichedBackgrounds));

  } catch (error) {
    console.error('Arka planları getirme hatası:', error);
    res.status(500).json(responseError('Arka planlar alınamadı'));
  }
};

// Belirli bir sayfa için arka planları getir
export const getPageBackgrounds = async (req, res) => {
  try {
    const { page } = req.params;

    if (!['home', 'products', 'blog'].includes(page)) {
      return res.status(400).json(responseError('Geçersiz sayfa'));
    }

    const backgroundsDir = path.join(__dirname, '../../../frontend/public/backgrounds');
    const result = {
      mobile: {
        video: null,
        image: null
      },
      desktop: {
        video: null,
        image: null
      }
    };

    if (fs.existsSync(backgroundsDir)) {
      const files = fs.readdirSync(backgroundsDir);

      files.forEach(file => {
        if (file.startsWith(`${page}-`)) {
          const ext = path.extname(file).toLowerCase();
          const isMobile = file.includes('-mobile');
          const isDesktop = file.includes('-desktop');

          if (ext === '.mp4') {
            if (isMobile) result.mobile.video = `/backgrounds/${file}`;
            if (isDesktop) result.desktop.video = `/backgrounds/${file}`;
          } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            if (isMobile) result.mobile.image = `/backgrounds/${file}`;
            if (isDesktop) result.desktop.image = `/backgrounds/${file}`;
          }
        }
      });
    }

    res.json(responseSuccess(result));

  } catch (error) {
    console.error('Sayfa arka planları getirme hatası:', error);
    res.status(500).json(responseError('Sayfa arka planları alınamadı'));
  }
};