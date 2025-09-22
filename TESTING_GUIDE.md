# 🧪 Bitki - Test ve Doğrulama Rehberi

Bu rehber, Bitki projesinin deployment öncesi ve sonrası test edilmesi için gerekli adımları içerir.

## 📋 Deployment Öncesi Testler

### 1. Backend Testleri
```bash
# Backend dizinine git
cd /Users/yildirim/Desktop/Bitki/backend

# Environment dosyasını kontrol et
cp .env.example .env
# .env dosyasını kendi değerlerinle düzenle

# Bağımlılıkları yükle ve çalıştır
npm install
npm run dev

# Health check testi
curl http://localhost:3000/api/health
```

**Beklenen Sonuç:**
```json
{
  "success": true,
  "message": "Şifalı Bitkiler API çalışıyor",
  "timestamp": "2024-XX-XX..."
}
```

### 2. Frontend Testleri

#### Public Site Testi
```bash
# Frontend dizinine git
cd /Users/yildirim/Desktop/Bitki/frontend

# Environment dosyasını ayarla
echo "VITE_API_BASE_URL=http://localhost:3000" > .env.local

# Bağımlılıkları yükle ve çalıştır
npm install
npm run dev
```

**Test Checklist:**
- ✅ Ana sayfa yükleniyor (http://localhost:5173)
- ✅ Ürünler sayfası çalışıyor
- ✅ CAPTCHA sistemi çalışıyor
- ✅ Kayıt/Giriş formları çalışıyor

#### Admin Panel Testi
```bash
# Admin panel için ayrı terminal
npm run dev:admin
```

**Test Checklist:**
- ✅ Admin giriş sayfası yükleniyor (http://localhost:5174)
- ✅ Admin code ile giriş yapılabiliyor
- ✅ Dashboard görüntüleniyor
- ✅ Ürün yönetimi çalışıyor

## 🚀 Deployment Sonrası Testler

### 1. Production Backend Testi
```bash
# Backend URL'ini test et
curl https://bitki-backend.onrender.com/api/health
```

### 2. Production Frontend Testleri

#### Public Site (https://bitki.vercel.app)
- ✅ Ana sayfa yükleniyor
- ✅ Responsive tasarım çalışıyor
- ✅ API bağlantıları çalışıyor
- ✅ Ürün görüntüleme çalışıyor
- ✅ Sepet işlemleri çalışıyor
- ✅ CAPTCHA çalışıyor

#### Admin Panel (https://bitki-admin.vercel.app)
- ✅ Admin giriş sayfası yükleniyor
- ✅ Admin code: `BITKI_ADMIN_2024` ile giriş
- ✅ Tüm admin paneli sayfaları çalışıyor
- ✅ Dosya upload çalışıyor
- ✅ CRUD işlemleri çalışıyor

### 3. Database ve Dosya Testleri
- ✅ SQLite database çalışıyor
- ✅ Persistent disk çalışıyor (/opt/render/project/uploads)
- ✅ Dosya upload/download çalışıyor
- ✅ Resim gösterimi çalışıyor

## 🔧 Sorun Giderme

### Backend Sorunları

#### 1. CORS Hatası
```bash
# Backend logs kontrol et
# Render dashboard'dan logs sekmesine git
```
**Çözüm:** CORS ayarları zaten yapılandırıldı.

#### 2. Environment Variables Eksik
**Kontrol Et:**
- `JWT_SECRET` tanımlı mı?
- `ADMIN_ACCESS_CODE` tanımlı mı?
- `BASE_URL` doğru mu?

#### 3. Persistent Disk Sorunu
```bash
# Upload dizini kontrol et
ls -la /opt/render/project/uploads/
```

### Frontend Sorunları

#### 1. API Bağlantı Hatası
**Kontrol Et:**
- `VITE_API_BASE_URL` doğru tanımlı mı?
- Backend erişilebilir mi?

#### 2. Build Hatası
```bash
# Build komutunu test et
npm run build

# Preview çalıştır
npm run preview
```

#### 3. Admin Panel Erişim Sorunu
**Kontrol Et:**
- Admin code doğru mu: `BITKI_ADMIN_2024`
- Admin domain çalışıyor mu?

## 📊 Performance Testleri

### 1. API Response Time
```bash
# Backend response time test
time curl https://bitki-backend.onrender.com/api/health
```

### 2. Frontend Load Time
- Chrome DevTools → Network sekmesi
- Lighthouse performance test
- GTmetrix speed test

### 3. Database Performance
- SQLite query performance
- Upload/download hızları

## 🛡️ Güvenlik Testleri

### 1. HTTPS Kontrolü
- ✅ Tüm URL'ler HTTPS kullanıyor
- ✅ Mixed content yok
- ✅ SSL sertifikaları geçerli

### 2. Rate Limiting Testi
```bash
# Rate limit testleri
for i in {1..10}; do curl https://bitki-backend.onrender.com/api/health; done
```

### 3. Authentication Testi
- ✅ JWT token koruması çalışıyor
- ✅ Admin access code koruması çalışıyor
- ✅ Unauthorized access engellenmiş

## ✅ Final Checklist

### Pre-Deployment
- [ ] Tüm environment variables ayarlandı
- [ ] Local testler geçti
- [ ] Build işlemi başarılı
- [ ] CORS ayarları doğru

### Post-Deployment
- [ ] Backend health check ✅
- [ ] Public site erişilebilir ✅
- [ ] Admin panel erişilebilir ✅
- [ ] Database işlemleri çalışıyor ✅
- [ ] File upload çalışıyor ✅
- [ ] CAPTCHA sistemi çalışıyor ✅

## 🆘 Acil Durum Kurtarma

### Backend Down
1. Render dashboard kontrol et
2. Logs incelensin
3. Environment variables kontrol et
4. Restart service

### Frontend Down
1. Vercel dashboard kontrol et
2. Build logs incelensin
3. Environment variables kontrol et
4. Re-deploy tetikle

### Database Corruption
1. SQLite backup'tan geri yükle
2. Migration'ları yeniden çalıştır
3. Admin hesabını yeniden oluştur

---

**🎯 Test Tamamlandı!**

📱 **Public Site:** https://bitki.vercel.app
🔐 **Admin Panel:** https://bitki-admin.vercel.app
🔧 **API Backend:** https://bitki-backend.onrender.com