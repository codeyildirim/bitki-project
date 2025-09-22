import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { responseSuccess, responseError } from '../utils/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Frontend public/backgrounds klasörünün yolu
const BACKGROUNDS_DIR = path.join(__dirname, '../../../frontend/public/backgrounds');

// Klasör yoksa oluştur
if (!fs.existsSync(BACKGROUNDS_DIR)) {
  fs.mkdirSync(BACKGROUNDS_DIR, { recursive: true });
  console.log('Backgrounds klasörü oluşturuldu:', BACKGROUNDS_DIR);
}

// Multer storage yapılandırması
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Klasörün varlığını kontrol et
    if (!fs.existsSync(BACKGROUNDS_DIR)) {
      fs.mkdirSync(BACKGROUNDS_DIR, { recursive: true });
    }
    cb(null, BACKGROUNDS_DIR);
  },
  filename: (req, file, cb) => {
    // Geçici dosya adı kullan, sonra işlem sırasında yeniden adlandır
    const ext = path.extname(file.originalname).toLowerCase();
    const tempName = `temp_${Date.now()}${ext}`;
    cb(null, tempName);
  }
});

// Dosya filtresi
const fileFilter = (req, file, cb) => {
  const { format } = req.body;

  console.log('FileFilter - Format:', format, 'Mimetype:', file.mimetype, 'Filename:', file.originalname);

  // Format parametresi yoksa dosya uzantısından belirle
  let detectedFormat = format;
  if (!detectedFormat) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.mp4') {
      detectedFormat = 'video';
    } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      detectedFormat = 'image';
    }
  }

  if (detectedFormat === 'video') {
    // Video formatları
    if (file.mimetype === 'video/mp4' || file.originalname.toLowerCase().endsWith('.mp4')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece MP4 video formatı kabul edilir'), false);
    }
  } else if (detectedFormat === 'image') {
    // Resim formatları
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (validImageTypes.includes(file.mimetype) || validExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece JPG, PNG veya WebP resim formatları kabul edilir'), false);
    }
  } else {
    cb(new Error('Desteklenmeyen dosya formatı'), false);
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Maksimum 50MB (desktop için)
  }
});

// Upload endpoint controller
export const uploadBackground = (req, res) => {
  console.log('Upload endpoint called');
  console.log('Initial Body:', req.body);

  // Multer middleware'ini direkt olarak çağır
  upload.single('file')(req, res, async (err) => {
    console.log('After multer - Body:', req.body);
    console.log('After multer - File:', req.file);

    if (err) {
      console.error('Multer error:', err);

      // Multer hatalarını özel olarak ele al
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json(responseError('Dosya boyutu çok büyük. Maksimum 50MB'));
        }
        return res.status(400).json(responseError(`Dosya yükleme hatası: ${err.message}`));
      }

      // Diğer hatalar
      return res.status(400).json(responseError(err.message || 'Dosya yükleme hatası'));
    }

    try {
      const { page, type, format } = req.body;

      // Parametre validasyonu
      if (!page) {
        return res.status(400).json(responseError('page parametresi gerekli (home, products veya blog)'));
      }

      if (!type) {
        return res.status(400).json(responseError('type parametresi gerekli (mobile veya desktop)'));
      }

      if (!['home', 'products', 'blog'].includes(page)) {
        return res.status(400).json(responseError('Geçersiz page değeri. home, products veya blog olmalı'));
      }

      if (!['mobile', 'desktop'].includes(type)) {
        return res.status(400).json(responseError('Geçersiz type değeri. mobile veya desktop olmalı'));
      }

      if (!req.file) {
        return res.status(400).json(responseError('Dosya yüklenmedi. file parametresi gerekli'));
      }

      // Format'ı dosya uzantısından belirle
      const ext = path.extname(req.file.originalname).toLowerCase();
      const finalFormat = ext === '.mp4' ? 'video' : 'image';

      // Dosya boyutu kontrolü
      const maxSize = type === 'mobile' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
      if (req.file.size > maxSize) {
        // Yüklenen dosyayı sil
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json(responseError(`Dosya boyutu çok büyük. Maksimum: ${type === 'mobile' ? '10MB' : '50MB'}`));
      }

      // Doğru dosya adını oluştur ve dosyayı yeniden adlandır
      const correctFilename = `${page}-${type}${ext}`;
      const correctPath = path.join(BACKGROUNDS_DIR, correctFilename);

      // Geçici dosyayı doğru isimle yeniden adlandır
      try {
        fs.renameSync(req.file.path, correctPath);
        req.file.filename = correctFilename;
        req.file.path = correctPath;
      } catch (renameError) {
        console.error('Dosya yeniden adlandırma hatası:', renameError);
        // Geçici dosyayı sil
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json(responseError('Dosya kaydetme hatası'));
      }

      // Eski dosyaları temizle (aynı page-type-format kombinasyonu için)
      try {
        const files = fs.readdirSync(BACKGROUNDS_DIR);
        const extensions = finalFormat === 'video' ? ['.mp4'] : ['.jpg', '.jpeg', '.png', '.webp'];

        files.forEach(file => {
          extensions.forEach(ext => {
            const oldFilename = `${page}-${type}${ext}`;
            if (file === oldFilename && file !== req.file.filename) {
              const filePath = path.join(BACKGROUNDS_DIR, file);
              try {
                fs.unlinkSync(filePath);
                console.log(`Eski dosya silindi: ${file}`);
              } catch (err) {
                console.error(`Dosya silinemedi: ${file}`, err);
              }
            }
          });
        });
      } catch (error) {
        console.error('Eski dosya temizleme hatası:', error);
      }

      console.log('Upload successful:', {
        filename: req.file.filename,
        path: `/backgrounds/${req.file.filename}`,
        size: req.file.size,
        page,
        type,
        format: finalFormat
      });

      res.json(responseSuccess({
        filename: req.file.filename,
        path: `/backgrounds/${req.file.filename}`,
        size: req.file.size,
        page,
        type,
        format: finalFormat
      }, 'Arka plan başarıyla yüklendi'));

    } catch (error) {
      console.error('Upload processing error:', error);
      res.status(500).json(responseError('Sunucu hatası'));
    }
  });
};

// Delete endpoint controller
export const deleteBackground = async (req, res) => {
  try {
    const { page, type, format } = req.body;

    console.log('Delete request:', { page, type, format });

    // Parametre validasyonu
    if (!page) {
      return res.status(400).json(responseError('page parametresi gerekli'));
    }

    if (!type) {
      return res.status(400).json(responseError('type parametresi gerekli'));
    }

    if (!format) {
      return res.status(400).json(responseError('format parametresi gerekli'));
    }

    if (!['home', 'products', 'blog'].includes(page)) {
      return res.status(400).json(responseError('Geçersiz page değeri'));
    }

    if (!['mobile', 'desktop'].includes(type)) {
      return res.status(400).json(responseError('Geçersiz type değeri'));
    }

    if (!['video', 'image'].includes(format)) {
      return res.status(400).json(responseError('Geçersiz format değeri'));
    }

    // Silinecek dosyaları bul
    const files = fs.readdirSync(BACKGROUNDS_DIR);
    const extensions = format === 'video' ? ['.mp4'] : ['.jpg', '.jpeg', '.png', '.webp'];
    let deletedCount = 0;

    extensions.forEach(ext => {
      const filename = `${page}-${type}${ext}`;
      const filePath = path.join(BACKGROUNDS_DIR, filename);

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Dosya silindi: ${filename}`);
        } catch (err) {
          console.error(`Dosya silinemedi: ${filename}`, err);
        }
      }
    });

    if (deletedCount > 0) {
      res.json(responseSuccess({
        deletedCount,
        page,
        type,
        format
      }, 'Arka plan başarıyla silindi'));
    } else {
      res.status(404).json(responseError('Silinecek dosya bulunamadı'));
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// List backgrounds controller
export const listBackgrounds = async (req, res) => {
  try {
    // Klasörün varlığını kontrol et
    if (!fs.existsSync(BACKGROUNDS_DIR)) {
      fs.mkdirSync(BACKGROUNDS_DIR, { recursive: true });
    }

    const files = fs.readdirSync(BACKGROUNDS_DIR);
    const backgrounds = {
      home: { mobile: {}, desktop: {} },
      products: { mobile: {}, desktop: {} },
      blog: { mobile: {}, desktop: {} }
    };

    files.forEach(file => {
      const match = file.match(/^(home|products|blog)-(mobile|desktop)\.(mp4|jpg|jpeg|png|webp)$/);
      if (match) {
        const [, page, type, ext] = match;
        const format = ext === 'mp4' ? 'video' : 'image';
        const filePath = path.join(BACKGROUNDS_DIR, file);
        const stats = fs.statSync(filePath);

        backgrounds[page][type][format] = {
          filename: file,
          path: `/backgrounds/${file}`,
          size: stats.size,
          modified: stats.mtime
        };
      }
    });

    console.log('Listed backgrounds:', backgrounds);
    res.json(responseSuccess(backgrounds, 'Arka planlar listelendi'));

  } catch (error) {
    console.error('List error:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};