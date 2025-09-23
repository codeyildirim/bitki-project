import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../database.sqlite');

class Database {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
    this.init();
  }

  init() {
    this.db.serialize(() => {
      // Kullanıcılar tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nickname TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          recovery_code_hash TEXT NOT NULL,
          city TEXT NOT NULL,
          is_admin BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // IP ban tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS ip_bans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ip_address TEXT NOT NULL,
          is_cidr BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Kategoriler tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT UNIQUE,
          description TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Ürünler tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          stock INTEGER DEFAULT 0,
          category_id INTEGER,
          images TEXT, -- JSON array
          rating DECIMAL(2,1) DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        )
      `);

      // Ürün yorumları tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS product_reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          author_name TEXT NOT NULL,
          comment TEXT NOT NULL,
          rating INTEGER CHECK(rating >= 1 AND rating <= 5),
          is_approved BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Siparişler tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'bekliyor', -- bekliyor, onaylandı, hazırlanıyor, kargoda, tamamlandı, iptal
          payment_method TEXT NOT NULL, -- iban, crypto
          payment_proof TEXT, -- dekont/ekran görüntüsü dosya yolu
          tracking_number TEXT,
          shipping_address TEXT NOT NULL, -- JSON
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Sipariş ürünleri tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Blog yazıları tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          author_id INTEGER NOT NULL,
          is_published BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users (id)
        )
      `);

      // Blog yorumları tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS blog_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          comment TEXT NOT NULL,
          is_approved BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES blog_posts (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Ayarlar tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // GIF alanları tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS gif_sections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          gif_url TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Kuponlar tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS coupons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          description TEXT,
          discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed')),
          discount_value DECIMAL(10,2) NOT NULL,
          min_purchase_amount DECIMAL(10,2) DEFAULT 0,
          max_discount_amount DECIMAL(10,2),
          usage_limit INTEGER DEFAULT NULL,
          used_count INTEGER DEFAULT 0,
          valid_from DATETIME,
          valid_until DATETIME,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Kampanyalar tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          campaign_type TEXT CHECK(campaign_type IN ('discount', 'free_shipping', 'buy_x_get_y', 'bundle')),
          discount_percentage DECIMAL(5,2),
          min_items INTEGER,
          required_category_id INTEGER,
          valid_from DATETIME,
          valid_until DATETIME,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (required_category_id) REFERENCES categories (id)
        )
      `);

      // PWA istatistikleri tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS pwa_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          event_type TEXT CHECK(event_type IN ('install', 'uninstall', 'update', 'launch')),
          device_info TEXT,
          ip_address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Canlı destek hazır cevaplar tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS support_templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          keywords TEXT,
          usage_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Sıkça sorulan sorular tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS faqs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          order_index INTEGER DEFAULT 0,
          view_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Arka plan yönetimi tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS page_backgrounds (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          page TEXT NOT NULL CHECK(page IN ('home', 'products', 'blog')),
          device_type TEXT NOT NULL CHECK(device_type IN ('mobile', 'desktop')),
          file_type TEXT NOT NULL CHECK(file_type IN ('video', 'image')),
          file_path TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_size INTEGER,
          uploaded_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES users (id),
          UNIQUE(page, device_type, file_type)
        )
      `);

      // Push bildirimleri tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS push_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          icon TEXT,
          url TEXT,
          target_audience TEXT CHECK(target_audience IN ('all', 'customers', 'admins', 'specific')),
          target_user_ids TEXT,
          sent_count INTEGER DEFAULT 0,
          read_count INTEGER DEFAULT 0,
          is_sent BOOLEAN DEFAULT 0,
          scheduled_at DATETIME,
          sent_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Push abonelikleri tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          endpoint TEXT UNIQUE NOT NULL,
          keys TEXT NOT NULL,
          device_info TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Kupon kullanım geçmişi tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS coupon_usage (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          coupon_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          order_id INTEGER NOT NULL,
          discount_amount DECIMAL(10,2) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (coupon_id) REFERENCES coupons (id),
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (order_id) REFERENCES orders (id)
        )
      `);

      // Site ayarları tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          settings_data TEXT NOT NULL, -- JSON string
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Admin işlem logları tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS admin_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          admin_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          details TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES users (id)
        )
      `);

      // Destek talepleri tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'open', -- open, in_progress, closed
          priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
          category TEXT,
          admin_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (admin_id) REFERENCES users (id)
        )
      `);

      // Destek talep mesajları tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS ticket_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticket_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          message TEXT NOT NULL,
          is_admin BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES tickets (id),
          FOREIGN KEY (sender_id) REFERENCES users (id)
        )
      `);

      // PWA bildirimleri tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS pwa_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          icon TEXT,
          url TEXT,
          is_read BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // CAPTCHA sessions tablosu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS captcha_sessions (
          id TEXT PRIMARY KEY,
          solution_index INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          used BOOLEAN DEFAULT 0,
          ip TEXT,
          attempts INTEGER DEFAULT 0,
          verified BOOLEAN DEFAULT 0,
          verification_token TEXT,
          verified_at DATETIME
        )
      `);

      // Mevcut tabloları güncelle
      this.updateTables();

      // Varsayılan admin kullanıcısı oluştur
      this.createDefaultAdmin();
    });
  }

  updateTables() {
    // Categories tablosuna eksik sütunları ekle
    this.db.run(`ALTER TABLE categories ADD COLUMN slug TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('Slug column already exists or error:', err.message);
      }
    });

    this.db.run(`ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT 1`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('is_active column already exists or error:', err.message);
      }
    });

    this.db.run(`ALTER TABLE categories ADD COLUMN image_url TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('image_url column already exists or error:', err.message);
      }
    });

    this.db.run(`ALTER TABLE categories ADD COLUMN parent_id INTEGER`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('parent_id column already exists or error:', err.message);
      }
    });

    // Users tablosuna IP tracking alanları ekle
    this.db.run(`ALTER TABLE users ADD COLUMN registration_ip TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('registration_ip column already exists or error:', err.message);
      }
    });

    this.db.run(`ALTER TABLE users ADD COLUMN last_ip TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('last_ip column already exists or error:', err.message);
      }
    });

    this.db.run(`ALTER TABLE users ADD COLUMN last_login_at DATETIME`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('last_login_at column already exists or error:', err.message);
      }
    });

    // Products tablosuna eksik sütunları ekle
    this.db.run(`ALTER TABLE products ADD COLUMN videos TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('videos column already exists or error:', err.message);
      }
    });

    this.db.run(`ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT 0`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('is_featured column already exists or error:', err.message);
      }
    });

    // IP bans tablosuna reason alanı ekle
    this.db.run(`ALTER TABLE ip_bans ADD COLUMN reason TEXT DEFAULT 'Manual ban'`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('reason column already exists or error:', err.message);
      }
    });
  }

  async createDefaultAdmin() {
    const bcrypt = await import('bcryptjs');
    const adminPassword = bcrypt.default.hashSync('admin123', 10);
    const recoveryCode = bcrypt.default.hashSync('ADMIN-RECOVERY-2024', 10);

    // Check if admin already exists
    this.db.get('SELECT id FROM users WHERE is_admin = 1', (err, row) => {
      if (err) {
        console.error('❌ Admin check error:', err);
        return;
      }

      if (row) {
        console.log('✅ Admin account already exists');
        return;
      }

      // Create admin account
      this.db.run(`
        INSERT INTO users (nickname, password_hash, recovery_code_hash, city, is_admin, registration_ip, last_ip)
        VALUES ('admin', ?, ?, 'istanbul', 1, '127.0.0.1', '127.0.0.1')
      `, [adminPassword, recoveryCode], function(err) {
        if (err) {
          console.error('❌ Failed to create admin:', err);
        } else {
          console.log('✅ Production admin account created!');
          console.log('🔑 Username: admin | Password: admin123');
          console.log('🌐 Admin Panel: https://bitki-admin.vercel.app');
        }
      });
    });
  }

  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    this.db.close();
  }
}

export default new Database();