import db from '../models/database.js';

// Sistem ayarlarını getir
export const getSettings = async (req, res) => {
  try {
    const query = 'SELECT * FROM site_settings ORDER BY id DESC LIMIT 1';
    const settings = await db.get(query);

    let settingsData = {
      siteName: 'Şifalı Bitkiler',
      siteDescription: 'Doğal şifalı bitkiler ve gıda takviyesi merkezi',
      currency: 'TL',
      taxRate: 20,
      shippingCost: 29.99,
      freeShippingThreshold: 150,
      maintenanceMode: false,
      emailNotifications: true,
      pushNotifications: true,
      autoApproveComments: false,
      maxFileSize: 5,
      maxProductImages: 10,
      sessionTimeout: 30,
      passwordMinLength: 6,
      enableTwoFactor: false,
      supportEmail: 'destek@sifalibitkiler.com',
      supportPhone: '+90 555 123 4567',
      socialLinks: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      }
    };

    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings.settings_data);
        settingsData = { ...settingsData, ...parsedSettings };
      } catch (err) {
        console.error('Settings parse error:', err);
      }
    }

    res.json({
      success: true,
      data: settingsData
    });
  } catch (error) {
    console.error('Settings get error:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar yüklenirken hata oluştu'
    });
  }
};

// Sistem ayarlarını kaydet
export const saveSettings = async (req, res) => {
  try {
    const settingsData = JSON.stringify(req.body);

    // Mevcut ayarları kontrol et
    const existingSettings = await db.get('SELECT * FROM site_settings ORDER BY id DESC LIMIT 1');

    if (existingSettings) {
      // Güncelle
      await db.run(
        'UPDATE site_settings SET settings_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [settingsData, existingSettings.id]
      );
    } else {
      // Yeni kayıt oluştur
      await db.run(
        'INSERT INTO site_settings (settings_data) VALUES (?)',
        [settingsData]
      );
    }

    res.json({
      success: true,
      message: 'Ayarlar başarıyla kaydedildi'
    });
  } catch (error) {
    console.error('Settings save error:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar kaydedilirken hata oluştu'
    });
  }
};

// Site ayarlarını public olarak getir (frontend için)
export const getPublicSettings = async (req, res) => {
  try {
    const query = 'SELECT * FROM site_settings ORDER BY id DESC LIMIT 1';
    const settings = await db.get(query);

    let publicSettings = {
      siteName: 'Şifalı Bitkiler',
      siteDescription: 'Doğal şifalı bitkiler ve gıda takviyesi merkezi',
      currency: 'TL',
      taxRate: 20,
      shippingCost: 29.99,
      freeShippingThreshold: 150,
      supportEmail: 'destek@sifalibitkiler.com',
      supportPhone: '+90 555 123 4567',
      socialLinks: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      }
    };

    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings.settings_data);
        // Sadece public alanları döndür
        publicSettings = {
          siteName: parsedSettings.siteName || publicSettings.siteName,
          siteDescription: parsedSettings.siteDescription || publicSettings.siteDescription,
          currency: parsedSettings.currency || publicSettings.currency,
          taxRate: parsedSettings.taxRate || publicSettings.taxRate,
          shippingCost: parsedSettings.shippingCost || publicSettings.shippingCost,
          freeShippingThreshold: parsedSettings.freeShippingThreshold || publicSettings.freeShippingThreshold,
          supportEmail: parsedSettings.supportEmail || publicSettings.supportEmail,
          supportPhone: parsedSettings.supportPhone || publicSettings.supportPhone,
          socialLinks: parsedSettings.socialLinks || publicSettings.socialLinks,
          maintenanceMode: parsedSettings.maintenanceMode || false
        };
      } catch (err) {
        console.error('Settings parse error:', err);
      }
    }

    res.json({
      success: true,
      data: publicSettings
    });
  } catch (error) {
    console.error('Public settings get error:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar yüklenirken hata oluştu'
    });
  }
};

export default {
  getSettings,
  saveSettings,
  getPublicSettings
};