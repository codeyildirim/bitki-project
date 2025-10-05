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

    // Aktif kullanıcılar (son 7 gün) - IP bazlı sayım
    const activeUsers = await db.get(`
      SELECT COUNT(DISTINCT ip_address) as count
      FROM pwa_stats
      WHERE event_type = 'launch'
        AND created_at >= datetime('now', '-7 days')
        AND ip_address IS NOT NULL
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

// Retry helper with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = error.statusCode === 429 || error.statusCode === 503 || error.code === 'ECONNREFUSED';

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.warn(`[PWA RETRY] ${attempt}/${maxRetries} attempt failed, retrying in ${delay}ms...`, {
        statusCode: error.statusCode,
        message: error.message
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Log to file helper
const logPushResult = (success, endpoint, error = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = success
    ? `[${timestamp}] OK: Push sent to ${endpoint.substring(0, 60)}...`
    : `[${timestamp}] FAIL: ${error?.statusCode || 'ERROR'} ${error?.message || 'Unknown'} for ${endpoint.substring(0, 60)}...`;

  console.log(logMessage);
  // In production, write to file: fs.appendFileSync('logs/pwa-delivery.log', logMessage + '\n');
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
    let failureCount = 0;

    for (const sub of subscriptions) {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: JSON.parse(sub.keys)
        };

        // Send with retry mechanism
        await retryWithBackoff(async () => {
          return await webpush.sendNotification(subscription, payload);
        });

        sentCount++;
        logPushResult(true, sub.endpoint);

      } catch (error) {
        failureCount++;
        logPushResult(false, sub.endpoint, error);

        // Handle specific error codes
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription expired or not found - deactivate
          console.warn(`[PWA] Deactivating expired subscription: ${error.statusCode}`);
          await db.run('UPDATE push_subscriptions SET is_active = 0 WHERE id = ?', [sub.id]);
        }

        // Log to push_failures table
        try {
          await db.run(`
            INSERT INTO push_failures (endpoint, error_code, error_message, notification_id, retry_count)
            VALUES (?, ?, ?, ?, ?)
          `, [
            sub.endpoint,
            error.statusCode || null,
            error.message || 'Unknown error',
            notificationId,
            error.retryCount || 0
          ]);
        } catch (dbError) {
          console.error('[PWA] Failed to log push failure:', dbError);
        }
      }
    }

    // Bildirim durumunu güncelle
    await db.run(`
      UPDATE push_notifications
      SET is_sent = 1, sent_at = datetime('now'), sent_count = ?
      WHERE id = ?
    `, [sentCount, notificationId]);

    console.log(`[PWA] Push delivery complete: ${sentCount} sent, ${failureCount} failed`);
    return sentCount;

  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
    throw error;
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
// Admin - Push başarısızlıklarını getir
export const getPushFailures = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const failures = await db.all(`
      SELECT
        pf.*,
        pn.title as notification_title,
        pn.body as notification_body
      FROM push_failures pf
      LEFT JOIN push_notifications pn ON pf.notification_id = pn.id
      ORDER BY pf.created_at DESC
      LIMIT ?
    `, [limit]);

    res.json(responseSuccess(failures));

  } catch (error) {
    console.error('Push failures getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};
