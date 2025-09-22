-- Sepet tablosu oluştur
CREATE TABLE IF NOT EXISTS cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- Kullanıcı adresleri tablosu oluştur
CREATE TABLE IF NOT EXISTS user_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title VARCHAR(100) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  city VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  postal_code VARCHAR(10),
  is_default BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ödeme yöntemleri tablosu oluştur
CREATE TABLE IF NOT EXISTS payment_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type VARCHAR(50) NOT NULL, -- 'iban', 'btc', 'eth', 'usdt_trc20'
  title VARCHAR(100) NOT NULL,
  details TEXT, -- JSON formatında ödeme detayları
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Varsayılan ödeme yöntemlerini ekle
INSERT OR IGNORE INTO payment_methods (type, title, details) VALUES
('iban', 'Banka Havalesi/EFT', '{"iban": "TR33 0006 1005 1978 6457 8413 26", "bank": "İş Bankası", "holder": "Şifalı Bitkiler E-Ticaret A.Ş."}'),
('btc', 'Bitcoin (BTC)', '{"address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"}'),
('eth', 'Ethereum (ETH)', '{"address": "0x742d35cc6634c0532925a3b8d4c1e5c2ea4eaf22"}'),
('usdt_trc20', 'USDT (TRC-20)', '{"address": "TLKJjgHdqUFqnqZRH2WfKP2R9QC9pP1nkq"}');