# 🚀 Kurulum ve Çalıştırma Kılavuzu

## 📋 Gereksinimler
- Node.js v18+
- npm veya yarn
- Modern web tarayıcısı (Chrome, Firefox, Safari, Edge)

## 🔧 Kurulum Adımları

### 1. Projeyi İndirin
```bash
git clone <repository-url>
cd sifalı-bitkiler-eticaret
```

### 2. Backend Kurulumu

```bash
# Backend klasörüne gidin
cd backend

# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun
cp ../.env.example .env

# .env dosyasını düzenleyin (isteğe bağlı)
# JWT_SECRET, kripto cüzdan adresleri vb. güncellenebilir

# Development modunda çalıştırın
npm run dev

# Production modunda çalıştırın
npm start
```

Backend varsayılan olarak http://localhost:3000 adresinde çalışacaktır.

### 3. Frontend Kurulumu

Yeni bir terminal penceresi açın:

```bash
# Frontend klasörüne gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# Development modunda çalıştırın
npm run dev

# Production build oluşturun
npm run build

# Production build'i önizleyin
npm run preview
```

Frontend varsayılan olarak http://localhost:5173 adresinde çalışacaktır.

## 🔑 Varsayılan Admin Hesabı

- **Nickname:** admin
- **Şifre:** admin123
- **Kurtarma Kodu:** RECOVERY_ADMIN_2024

⚠️ **ÖNEMLİ:** Production ortamında bu bilgileri hemen değiştirin!

## 📁 Proje Yapısı

```
├── backend/
│   ├── src/
│   │   ├── controllers/    # API controller'ları
│   │   ├── middleware/     # Express middleware'leri
│   │   ├── models/         # Veritabanı modelleri
│   │   ├── routes/         # API route'ları
│   │   └── utils/          # Yardımcı fonksiyonlar
│   ├── uploads/            # Yüklenen dosyalar
│   ├── data/               # Türkiye şehir verileri
│   └── database.sqlite     # SQLite veritabanı
├── frontend/
│   ├── public/
│   │   ├── manifest.json   # PWA manifest
│   │   └── sw.js          # Service Worker
│   └── src/
│       ├── components/     # React bileşenleri
│       ├── pages/          # Sayfa bileşenleri
│       ├── context/        # React context'leri
│       └── utils/          # Yardımcı fonksiyonlar
└── README.md
```

## 🌟 Yeni Özellikler

### ✅ Tamamlanan Özellikler

1. **Admin Panel Sistemi**
   - Admin giriş ve yönetim paneli
   - Kullanıcı yönetimi (silme, şifre sıfırlama)
   - IP/CIDR ban sistemi
   - İşlem logları kayıt sistemi

2. **Gelişmiş Kullanıcı Sistemi**
   - Nickname + şifre ile kayıt
   - Tek kullanımlık kurtarma kodu (REC_XXXX_XXXX_XXXX_XXXX formatında)
   - Kurtarma kodu ile şifre sıfırlama

3. **Sipariş ve Ödeme Akışı**
   - IBAN ve Kripto para ödeme seçenekleri (BTC, ETH, BNB)
   - Dekont/ekran görüntüsü yükleme
   - Manuel kargo takip numarası girişi
   - 5 aşamalı sipariş durumu takibi

4. **PWA Desteği**
   - Offline çalışma özelliği
   - Service Worker ile cache stratejisi
   - Web App olarak yüklenebilir

5. **Güvenlik Güncellemeleri**
   - Helmet.js ile güvenlik başlıkları
   - Farklı endpoint'ler için özelleştirilmiş rate limiting
   - IP ban kontrolü middleware'i
   - Admin işlem logları

6. **Frontend İyileştirmeleri**
   - Psikedelik animasyonlu arka plan (Ana sayfa)
   - Responsive ve modern tasarım
   - Dark/Light tema desteği

## 🔒 Güvenlik Notları

1. **Production için yapılması gerekenler:**
   - `.env` dosyasında JWT_SECRET değiştirin
   - Admin kullanıcı bilgilerini değiştirin
   - HTTPS kullanın
   - Kripto cüzdan adreslerini güncelleyin

2. **Rate Limiting:**
   - Login endpoint'leri: 15 dakikada 5 deneme
   - Genel API: 5 dakikada 100 istek

3. **IP Ban Sistemi:**
   - Admin panelinden IP veya CIDR bloğu eklenebilir
   - Banlanan IP'ler 403 Forbidden hatası alır

## 🚨 Sorun Giderme

### Veritabanı Hatası
```bash
# Backend klasöründe database.sqlite dosyasını silin
rm backend/database.sqlite
# Backend'i yeniden başlatın (otomatik oluşturulacak)
```

### Port Çakışması
```bash
# .env dosyasında PORT değişkenini değiştirin
PORT=3001
```

### Frontend Build Hatası
```bash
# node_modules'ı temizleyin
rm -rf frontend/node_modules
npm install
```

## 📱 PWA Kurulumu

1. Chrome'da siteyi açın
2. Adres çubuğunda "Install" ikonuna tıklayın
3. Veya üç nokta menüsünden "Install app" seçeneğini kullanın

## 📞 Destek

Sorunlar için GitHub Issues kullanın veya info@sifalibitkiler.com adresinden iletişime geçin.

---

# 🔧 Production Admin Hesabı Oluşturma

## Önce Bu Adımları Tamamlayın

### 1. Backend'i GitHub'a Push Edin
Setup endpoint'ini production'a göndermek için:

```bash
cd backend/
git add .
git commit -m "feat: add setup endpoint for admin account creation"
git push origin main
```

### 2. Render.com'da Redeploy Yapın
- Render.com dashboard'unuza gidin
- Backend servisinizi seçin
- "Manual Deploy" -> "Deploy latest commit" tıklayın
- Deploy'un tamamlanmasını bekleyin (2-3 dakika)

## Admin Hesabı Oluşturma

### Yöntem 1: Script ile (Önerilen)

1. `create-admin.js` dosyasını kullanın:
```bash
node create-admin.js
```

2. Script başarılı olursa şu bilgileri alacaksınız:
   - **Kullanıcı Adı:** admin
   - **Şifre:** admin123
   - **Kurtarma Kodu:** ADMIN-RECOVERY-2024

### Yöntem 2: Manuel API Çağrısı

Eğer script çalışmazsa, doğrudan API'yi çağırabilirsiniz:

```bash
# Önce mevcut admin kontrolü
curl https://bitki-backend.onrender.com/api/setup/check

# Admin hesabı oluştur
curl -X POST https://bitki-backend.onrender.com/api/setup/create-admin \
  -H "Content-Type: application/json"
```

### Yöntem 3: Tarayıcı ile

Tarayıcınızda şu URL'leri açın:

1. Kontrol için: `https://bitki-backend.onrender.com/api/setup/check`
2. Admin oluştur için: `https://bitki-backend.onrender.com/api/setup/create-admin` (POST request)

## Admin Panel Giriş

Admin hesabınız oluşturulduktan sonra:

1. **Admin Panel URL:** https://bitki-admin.vercel.app
2. **Giriş Bilgileri:**
   - Kullanıcı Adı: `admin`
   - Şifre: `admin123`

## Güvenlik Önerileri

⚠️ **UYARI:** Production'da admin hesabı oluşturduktan sonra:

1. **Setup endpoint'ini devre dışı bırakın:**
   - `src/app.js` dosyasında `app.use('/api/setup', setupRoutes);` satırını comment out edin
   - Yeniden deploy edin

2. **Admin şifresini değiştirin:**
   - Admin panelinde giriş yapın
   - Profil ayarlarından şifrenizi güvenli bir şifreyle değiştirin

3. **Environment variables ekleyin:**
   - Render.com'da `ADMIN_ACCESS_CODE` environment variable'ı ekleyin
   - Bu kod olmadan admin girişi yapılamayacak

## Sorun Giderme

### "Admin hesabı zaten mevcut" Hatası
- Bu normal bir durumdur, admin hesabınız hazır
- Giriş bilgileri: admin / admin123

### "Bağlantı hatası"
- Render.com servisinizin çalıştığından emin olun
- Backend URL'sinin doğru olduğunu kontrol edin
- Deploy'un tamamlandığından emin olun

### "Not Found" Hatası
- Setup endpoint'i henüz deploy edilmemiş
- Önce GitHub'a push edin, sonra Render'da redeploy yapın

## Admin Hesabı Bilgileri

✅ **Standart Admin Hesabı:**
- **Kullanıcı Adı:** admin
- **Şifre:** admin123
- **Kurtarma Kodu:** ADMIN-RECOVERY-2024
- **Konum:** istanbul
- **Yetki:** Tam admin yetkisi

---

🌿 **Doğal yaşamın kapıları sizinle!** 🌿