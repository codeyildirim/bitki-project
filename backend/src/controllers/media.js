import { responseSuccess, responseError, logAdminAction } from '../utils/helpers.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Video yükleme ve güncelleme
export const uploadBackgroundVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(responseError('Video dosyası gereklidir'));
    }

    // Dosya uzantısını kontrol et
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension !== '.mp4') {
      // Yüklenen dosyayı sil
      fs.unlinkSync(req.file.path);
      return res.status(400).json(responseError('Sadece .mp4 formatında video dosyaları yüklenebilir'));
    }

    // Frontend videos klasör yolu
    const videosDir = path.join(__dirname, '../../../frontend/public/videos');
    const targetPath = path.join(videosDir, 'current-background.mp4');

    // Videos klasörü yoksa oluştur
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Eski video varsa sil
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }

    // Yeni videoyu hedef konuma taşı
    fs.renameSync(req.file.path, targetPath);

    // Admin log kaydet
    await logAdminAction(
      req.db || req.app.locals.db,
      req.user.id,
      'UPLOAD_BACKGROUND_VIDEO',
      `Arka plan videosu güncellendi: ${req.file.originalname}`,
      req
    );

    res.json(responseSuccess({
      message: 'Arka plan videosu başarıyla güncellendi',
      videoPath: '/videos/current-background.mp4'
    }));

  } catch (error) {
    console.error('Video yükleme hatası:', error);

    // Hata durumunda geçici dosyayı temizle
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json(responseError('Video yükleme işlemi başarısız'));
  }
};

// Mevcut video bilgisini getir
export const getCurrentVideo = async (req, res) => {
  try {
    const videosDir = path.join(__dirname, '../../../frontend/public/videos');
    const videoPath = path.join(videosDir, 'current-background.mp4');

    const videoExists = fs.existsSync(videoPath);

    if (videoExists) {
      const stats = fs.statSync(videoPath);
      res.json(responseSuccess({
        exists: true,
        path: '/videos/current-background.mp4',
        size: stats.size,
        lastModified: stats.mtime
      }));
    } else {
      res.json(responseSuccess({
        exists: false,
        path: null
      }));
    }

  } catch (error) {
    console.error('Video bilgisi getirme hatası:', error);
    res.status(500).json(responseError('Video bilgisi alınamadı'));
  }
};

// Video önizleme (thumbnail) oluşturma - gelişmiş özellik
export const generateVideoThumbnail = async (req, res) => {
  try {
    // Bu özellik için ffmpeg gerekir, şimdilik basit response döndürüyoruz
    res.json(responseSuccess({
      thumbnail: '/videos/current-background-thumb.jpg',
      message: 'Thumbnail özelliği geliştirilme aşamasında'
    }));
  } catch (error) {
    console.error('Thumbnail oluşturma hatası:', error);
    res.status(500).json(responseError('Thumbnail oluşturulamadı'));
  }
};