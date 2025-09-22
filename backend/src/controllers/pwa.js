import { responseSuccess, responseError } from '../utils/helpers.js';
import db from '../models/database.js';
import webpush from 'web-push';

// Web Push konfigürasyonu
const setupWebPush = () => {
  // VAPID keys (bunları .env'ye taşıyabilirsiniz)
  const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BIb3RmkvdoXbCi9vRJZJqMq6Tn0HoLGwVWXBt8hNbN1mKs8Dd3DLnxlkdDTpU1EqTbgOHCfS_DfTZl6KEHpcvHo',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'EPJmP8MS_m8J1CwxRVHJVlIdBbhwCTkCZMvQRnoXc5k'
  };

  webpush.setVapidDetails(
    'mailto:info@sifalibitkiler.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
};

setupWebPush();

// PWA istatistik kaydet
export const trackPWAEvent = async (req, res) => {
  try {
    const { eventType, deviceInfo } = req.body;
    const userId = req.user?.id || null;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!eventType || !['install', 'uninstall', 'update', 'launch'].includes(eventType)) {
      return res.status(400).json(responseError('Geçersiz event tipi'));
    }

    await db.run(`
      INSERT INTO pwa_stats (user_id, event_type, device_info, ip_address)
      VALUES (?, ?, ?, ?)
    `, [userId, eventType, JSON.stringify(deviceInfo), ipAddress]);

    res.json(responseSuccess(null, 'Event kaydedildi'));

  } catch (error) {
    console.error('PWA event kaydetme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - PWA istatistiklerini getir
export const getPWAStats = async (req, res) => {
  try {
    // Toplam indirme sayısı
    const installStats = await db.get(`
      SELECT COUNT(*) as total FROM pwa_stats WHERE event_type = 'install'
    `);

    // Son 30 gün istatistikleri
    const last30Days = await db.all(`
      SELECT
        DATE(created_at) as date,
        event_type,
        COUNT(*) as count
      FROM pwa_stats
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY DATE(created_at), event_type
      ORDER BY date DESC
    `);

    // Cihaz dağılımı
    const deviceStats = await db.all(`
      SELECT
        device_info,
        COUNT(*) as count
      FROM pwa_stats
      WHERE event_type = 'install'
      GROUP BY device_info
    `);

    // Aktif kullanıcılar (son 7 gün)
    const activeUsers = await db.get(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM pwa_stats
      WHERE event_type = 'launch'
        AND created_at >= datetime('now', '-7 days')
    `);

    res.json(responseSuccess({
      totalInstalls: installStats.total,
      activeUsers: activeUsers.count,
      last30Days,
      deviceStats
    }));

  } catch (error) {
    console.error('PWA istatistikleri getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Push bildirim aboneliği kaydet
export const subscribePush = async (req, res) => {
  try {
    const { subscription, deviceInfo } = req.body;
    const userId = req.user?.id || null;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json(responseError('Geçersiz subscription verisi'));
    }

    // Mevcut aboneliği kontrol et
    const existing = await db.get('SELECT * FROM push_subscriptions WHERE endpoint = ?', [subscription.endpoint]);

    if (existing) {
      // Güncelle
      await db.run(`
        UPDATE push_subscriptions
        SET keys = ?, device_info = ?, is_active = 1
        WHERE endpoint = ?
      `, [JSON.stringify(subscription.keys), JSON.stringify(deviceInfo), subscription.endpoint]);
    } else {
      // Yeni ekle
      await db.run(`
        INSERT INTO push_subscriptions (user_id, endpoint, keys, device_info, is_active)
        VALUES (?, ?, ?, ?, 1)
      `, [userId, subscription.endpoint, JSON.stringify(subscription.keys), JSON.stringify(deviceInfo)]);
    }

    res.json(responseSuccess(null, 'Push bildirimleri aktif'));

  } catch (error) {
    console.error('Push abonelik hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Push bildirim aboneliği iptal
export const unsubscribePush = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json(responseError('Endpoint gereklidir'));
    }

    await db.run('UPDATE push_subscriptions SET is_active = 0 WHERE endpoint = ?', [endpoint]);
    res.json(responseSuccess(null, 'Push bildirimleri deaktive edildi'));

  } catch (error) {
    console.error('Push abonelik iptal hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - Push bildirim gönder
export const sendPushNotification = async (req, res) => {
  try {
    const {
      title,
      body,
      icon,
      url,
      targetAudience,
      targetUserIds,
      scheduledAt
    } = req.body;

    if (!title || !body) {
      return res.status(400).json(responseError('Başlık ve içerik gereklidir'));
    }

    // Bildirim kaydını oluştur
    const result = await db.run(`
      INSERT INTO push_notifications (
        title, body, icon, url, target_audience,
        target_user_ids, scheduled_at, is_sent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      title,
      body,
      icon || '/icon-192x192.png',
      url || '/',
      targetAudience || 'all',
      targetUserIds ? JSON.stringify(targetUserIds) : null,
      scheduledAt || null
    ]);

    // Hemen gönder (scheduledAt yoksa)
    if (!scheduledAt) {
      await sendNotificationToUsers(result.id);
    }

    res.json(responseSuccess({ id: result.id }, 'Bildirim oluşturuldu'));

  } catch (error) {
    console.error('Push bildirim gönderme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Bildirim gönderme yardımcı fonksiyonu
const sendNotificationToUsers = async (notificationId) => {
  try {
    const notification = await db.get('SELECT * FROM push_notifications WHERE id = ?', [notificationId]);
    if (!notification || notification.is_sent) return;

    // Hedef kitlesine göre aboneleri bul
    let subscriptions = [];

    if (notification.target_audience === 'all') {
      subscriptions = await db.all('SELECT * FROM push_subscriptions WHERE is_active = 1');
    } else if (notification.target_audience === 'specific' && notification.target_user_ids) {
      const userIds = JSON.parse(notification.target_user_ids);
      const placeholders = userIds.map(() => '?').join(',');
      subscriptions = await db.all(
        `SELECT * FROM push_subscriptions WHERE user_id IN (${placeholders}) AND is_active = 1`,
        userIds
      );
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon,
      badge: '/badge.png',
      url: notification.url,
      timestamp: Date.now()
    });

    let sentCount = 0;
    for (const sub of subscriptions) {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: JSON.parse(sub.keys)
        };

        await webpush.sendNotification(subscription, payload);
        sentCount++;
      } catch (error) {
        // Başarısız aboneliği deaktive et
        if (error.statusCode === 410) {
          await db.run('UPDATE push_subscriptions SET is_active = 0 WHERE id = ?', [sub.id]);
        }
      }
    }

    // Bildirim durumunu güncelle
    await db.run(`
      UPDATE push_notifications
      SET is_sent = 1, sent_at = datetime('now'), sent_count = ?
      WHERE id = ?
    `, [sentCount, notificationId]);

    return sentCount;
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
  }
};

// Admin - Bildirim listesi
export const getNotifications = async (req, res) => {
  try {
    const notifications = await db.all(`
      SELECT * FROM push_notifications
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json(responseSuccess(notifications));
  } catch (error) {
    console.error('Bildirimler getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin - Bildirim sil
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await db.get('SELECT * FROM push_notifications WHERE id = ?', [id]);
    if (!notification) {
      return res.status(404).json(responseError('Bildirim bulunamadı'));
    }

    if (notification.is_sent) {
      return res.status(400).json(responseError('Gönderilmiş bildirim silinemez'));
    }

    await db.run('DELETE FROM push_notifications WHERE id = ?', [id]);
    res.json(responseSuccess(null, 'Bildirim silindi'));

  } catch (error) {
    console.error('Bildirim silme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};