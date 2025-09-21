# 🌿 Şifalı Bitkiler E-Ticaret Platformu

Modern ve kullanıcı dostu doğal ürünler e-ticaret platformu. React + Node.js + SQLite ile geliştirilmiş, PWA desteği olan, blockchain entegrasyonlu kapsamlı e-ticaret çözümü.

## ✨ Özellikler

### 🛒 E-Ticaret
- Modern ve responsive tasarım
- Ürün katalog sistemi
- Gelişmiş arama ve filtreleme
- Sepet ve checkout sistemi
- Sipariş takibi

### 🔐 Kullanıcı Sistemi
- Nickname + şifre ile basit kayıt
- Şifre kurtarma sistemi (tek kullanımlık kod)
- Profil yönetimi
- Admin/kullanıcı rolleri

### 💳 Ödeme Sistemleri
- IBAN ile banka transferi
- Blockchain entegrasyonu (BTC, ETH, BNB)
- Dekont/ekran görüntüsü yükleme
- Manuel admin onay süreci

### 📦 Sipariş Yönetimi
- Otomatik sipariş numarası
- Durumu takibi (Bekliyor → Onaylandı → Hazırlanıyor → Kargoda → Tamamlandı)
- Kargo takip numarası entegrasyonu
- Detaylı sipariş geçmişi

### 🛡️ Güvenlik
- **Broken Circle CAPTCHA** - Kırık çember bulma tabanlı görsel doğrulama
- IP/CIDR ban sistemi
- JWT tabanlı kimlik doğrulama
- Rate limiting (CAPTCHA için 30 istek/dakika)
- Güvenli dosya yükleme
- SQLite tabanlı CAPTCHA session yönetimi

### 📱 PWA Desteği
- Offline çalışma
- Mobil uygulama benzeri deneyim
- Push notification hazır altyapı
- App store yüklenebilir

### 🎨 Tasarım
- Tailwind CSS ile modern tasarım
- Framer Motion animasyonları
- Responsive design
- Doğa teması (yeşil/kahverengi tonları)
- Hareketli GIF alanları (admin panelinden yönetilebilir)

## 🚀 Kurulum

### Gereksinimler
- Node.js (v20+) - **ÖNEMLİ: Node.js 20 veya üzeri gereklidir**
- npm veya yarn
- Modern web tarayıcısı

### 1. Projeyi İndirin
```bash
git clone <repository-url>
cd Bitki
```

### 2. Backend Kurulumu
```bash
cd backend

# Bağımlılıkları yükleyin (bcrypt paketi kaldırıldı, sadece bcryptjs kullanılıyor)
npm install

# Environment dosyasını oluşturun ve düzenleyin
cp ../.env.example .env

# ÖNEMLİ: .env dosyasında JWT_SECRET değerini güvenli bir değerle değiştirin!
# JWT_SECRET tanımlı değilse backend başlamayacaktır.

# Veritabanını başlatın ve serveri çalıştırın
npm run dev
```

Backend http://localhost:3000 adresinde çalışacaktır.

### 3. Frontend Kurulumu
```bash
cd ../frontend

# Bağımlılıkları yükleyin
npm install

# .env.local dosyası otomatik oluşturulmuştur (VITE_API_URL=http://localhost:3000/api)
# Gerekirse düzenleyebilirsiniz

# Development server'ı başlatın
npm run dev
```

Frontend http://localhost:5173 adresinde çalışacaktır.

### 4. Production Build
```bash
# Backend için
cd backend
npm start

# Frontend için
cd frontend
npm run build
npm run preview
```

## 🗃️ Veritabanı

Proje SQLite kullanır ve ilk çalıştırmada otomatik olarak şu tabloları oluşturur:

- **users** - Kullanıcı bilgileri
- **products** - Ürün katalog
- **categories** - Ürün kategorileri
- **orders** - Siparişler
- **order_items** - Sipariş detayları
- **product_reviews** - Ürün yorumları
- **blog_posts** - Blog yazıları
- **blog_comments** - Blog yorumları
- **ip_bans** - IP ban listesi
- **settings** - Sistem ayarları
- **gif_sections** - Hareketli GIF alanları

### Varsayılan Admin Hesabı
- **Nickname:** admin
- **Şifre:** admin123
- **Kurtarma Kodu:** RECOVERY_ADMIN_2024

## 🔧 Konfigürasyon

### Environment Değişkenleri (.env)
```env
# Domain ayarları
PUBLIC_DOMAIN=http://localhost:5173
ADMIN_DOMAIN=http://localhost:5173

# JWT Secret
JWT_SECRET=sifalı-bitkiler-super-secret-key-2024

# Blockchain RPC URLs
BSC_RPC_URL=https://bsc-dataseed.binance.org/
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

# Kripto Cüzdan Adresleri
BTC_ADDRESS=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
ETH_ADDRESS=0x742d35Cc6634C0532925a3b8D5c84a9999998Eb2
BNB_ADDRESS=0x742d35Cc6634C0532925a3b8D5c84a9999998Eb2

# IBAN Bilgileri
COMPANY_IBAN=TR33 0006 1005 1978 6457 8413 26
COMPANY_NAME=Şifalı Bitkiler E-Ticaret A.Ş.
BANK_NAME=İş Bankası

# Server Port
PORT=3000
```

### Frontend Konfigürasyonu (vite.config.js)
- PWA ayarları
- Proxy konfigürasyonu
- Build optimizasyonları

## 📁 Proje Yapısı

```
sifalı-bitkiler-eticaret/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controller'ları
│   │   ├── middleware/      # Express middleware'leri
│   │   ├── models/          # Veritabanı modelleri
│   │   ├── routes/          # API route'ları
│   │   ├── utils/           # Yardımcı fonksiyonlar
│   │   └── app.js           # Ana Express uygulaması
│   ├── uploads/             # Yüklenen dosyalar
│   ├── data/                # Statik veri dosyaları
│   └── database.sqlite      # SQLite veritabanı
├── frontend/
│   ├── public/              # Statik dosyalar
│   ├── src/
│   │   ├── components/      # React bileşenleri
│   │   ├── pages/           # Sayfa bileşenleri
│   │   ├── context/         # React context'leri
│   │   ├── utils/           # Yardımcı fonksiyonlar
│   │   ├── hooks/           # Custom hook'lar
│   │   └── assets/          # Medya dosyaları
│   └── dist/                # Build çıktısı
└── README.md
```

## 🔗 API Endpoints

### Auth
- `POST /api/auth/register` - Kayıt (CAPTCHA token gerekli)
- `POST /api/auth/login` - Giriş (CAPTCHA token gerekli)
- `POST /api/auth/recover-password` - Şifre kurtarma
- `GET /api/auth/profile` - Profil bilgisi
- `PUT /api/auth/profile` - Profil güncelleme

### CAPTCHA
- `GET /api/captcha/new` - Yeni CAPTCHA oluştur
- `POST /api/captcha/verify` - CAPTCHA doğrulama
- `GET /api/captcha/stats` - CAPTCHA istatistikleri (admin)

### Products
- `GET /api/products` - Ürün listesi
- `GET /api/products/:id` - Ürün detayı
- `GET /api/products/featured` - Öne çıkan ürünler
- `GET /api/products/categories` - Kategoriler
- `POST /api/products/:id/reviews` - Ürün yorumu

### Orders
- `POST /api/orders` - Sipariş oluştur
- `GET /api/orders` - Kullanıcı siparişleri
- `GET /api/orders/:id` - Sipariş detayı
- `POST /api/orders/:id/payment-proof` - Ödeme belgesi

### Admin
- `GET /api/admin/users` - Kullanıcı listesi
- `GET /api/admin/orders` - Tüm siparişler
- `POST /api/admin/products` - Ürün ekleme
- `GET /api/admin/ip-bans` - IP ban listesi
- `GET /api/admin/reviews` - Yorumlar

### Blog
- `GET /api/blog` - Blog yazıları
- `GET /api/blog/:id` - Blog yazısı detayı
- `POST /api/blog/:id/comments` - Blog yorumu

### General
- `GET /api/cities` - Türkiye şehir/ilçe verileri
- `GET /api/crypto/addresses` - Kripto cüzdan adresleri
- `GET /api/health` - Sistem durumu

## 🔐 Güvenlik Özellikleri

- **Rate Limiting:**
  - Login endpoint'leri: 15 dakikada 5 istek
  - CAPTCHA endpoint'leri: 1 dakikada 30 istek
  - Genel API: 5 dakikada 100 istek
  - Global limit: 5 dakikada 300 istek
- **IP Ban:** Admin panelinden IP/CIDR ban
- **File Upload:** Güvenli dosya yükleme
  - İzin verilen formatlar: PNG, JPEG, WEBP (resim), MP4, WEBM (video)
  - Maksimum dosya boyutu: 20MB
  - MIME type kontrolü
- **JWT:** Token tabanlı kimlik doğrulama (fallback key kaldırıldı)
- **Input Validation:** Tüm girdiler doğrulanır
- **SQL Injection:** Prepared statement'lar
- **XSS Protection:** Helmet.js güvenlik başlıkları
- **Body Size Limit:** 1MB JSON/form limiti

## 🌍 Uluslararasılaştırma

- Tam Türkçe arayüz
- Türkiye şehir/ilçe verileri
- TRY para birimi formatı
- Türk telefon numarası formatı

## 📱 PWA Özellikleri

- **Manifest:** Web app manifest dosyası
- **Service Worker:** Offline çalışma desteği
- **Icons:** Farklı boyutlarda app ikonları
- **Installable:** Cihaza yüklenebilir
- **Responsive:** Tüm cihazlarda uyumlu

## 🔮 Blockchain Entegrasyonu

- **Web3.js:** Ethereum/BSC blockchain entegrasyonu
- **Transaction Verification:** İşlem doğrulama
- **Multi-Crypto:** BTC, ETH, BNB desteği
- **Real-time Rates:** Anlık kur çevrimi
- **Secure:** Güvenli cüzdan entegrasyonu

## 🧪 Test

```bash
# Backend testleri
cd backend
npm test

# Frontend testleri
cd frontend
npm test

# E2E testleri
npm run test:e2e
```

## 📈 Performans

- **Lazy Loading:** Sayfa bazlı kod bölünmesi
- **Image Optimization:** Resim optimizasyonu
- **Caching:** Browser ve service worker cache
- **Bundle Size:** Optimize edilmiş bundle boyutu
- **SEO Ready:** Meta tag'ler ve sitemap

## 🚀 Deployment

### Vercel/Netlify (Frontend)
```bash
npm run build
# Dist klasörünü deploy edin
```

### Railway/Heroku (Backend)
```bash
# Environment değişkenlerini ayarlayın
# Repository'yi bağlayın
# Otomatik deploy
```

### VPS/Self-Hosted
```bash
# PM2 ile process management
npm install -g pm2
pm2 start backend/src/app.js --name "sifalı-bitkiler-api"
pm2 startup
pm2 save
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## 📞 İletişim

- **Email:** info@sifalibitkiler.com
- **Website:** https://sifalibitkiler.com
- **GitHub:** https://github.com/sifalibitkiler/eticaret

## 🙏 Teşekkürler

- React ve Node.js topluluğuna
- Tailwind CSS ekibine
- Framer Motion geliştiricilerine
- Açık kaynak topluluğuna

---

🌿 **Doğal yaşamın kapıları size açık!** 🌿