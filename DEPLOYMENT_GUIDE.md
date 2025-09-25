# 🌿 Bitki - Ücretsiz Deployment Rehberi

Bu rehber, Bitki projesini tamamen **ücretsiz** platformlarda yayınlama adımlarını içerir.

## 📋 Gereksinimler

- GitHub hesabı (ücretsiz)
- Render hesabı (ücretsiz)
- Vercel hesabı (ücretsiz)

---

## 🎯 1. BACKEND DEPLOYMENT (Render)

### Adım 1: GitHub'a Upload
```bash
# Proje dizinine git
cd /Users/yildirim/Desktop/Bitki

# Git repository oluştur (henüz yoksa)
git init
git add .
git commit -m "Initial commit: Bitki e-commerce project"

# GitHub'a push et
git remote add origin https://github.com/KULLANICI_ADINIZ/bitki-backend.git
git push -u origin main
```

### Adım 2: Render'da Backend Kurulumu

1. **Render.com**'a git → "New Web Service" tıkla
2. GitHub repository'ni bağla: `bitki-backend`
3. Ayarlar:
   - **Name:** `bitki-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

4. **Environment Variables** ekle:
   ```
   NODE_ENV=production
   JWT_SECRET=[RENDER OTOMATIK OLUŞTURACAK]
   ADMIN_ACCESS_CODE=BITKI_ADMIN_2024
   BASE_URL=https://bitki-project.onrender.com
   ```

5. **Persistent Disk** ayarla:
   - Disk Name: `uploads`
   - Mount Path: `/opt/render/project/uploads`
   - Size: `1GB`

6. **Deploy** butonuna tıkla

### Adım 3: Doğrulama
Backend URL'niz: `https://bitki-project.onrender.com`

Test: `https://bitki-project.onrender.com/api/health`

---

## 🌐 2. FRONTEND DEPLOYMENT (Vercel)

### Adım 1: Frontend Environment Dosyaları

Dosya: `frontend/.env.production`
```env
VITE_API_BASE_URL=https://bitki-project.onrender.com
VITE_NODE_ENV=production
VITE_PUBLIC_DOMAIN=https://bitki.vercel.app
VITE_ADMIN_DOMAIN=https://bitki-admin.vercel.app
```

### Adım 2: İki Ayrı Vercel Projesi

#### 2.1 Public Site (Müşteri)
1. **Vercel.com**'a git → "New Project"
2. GitHub repo import et: `bitki-frontend`
3. Ayarlar:
   - **Project Name:** `bitki`
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://bitki-project.onrender.com
   VITE_NODE_ENV=production
   VITE_ADMIN=false
   ```

5. Deploy

#### 2.2 Admin Panel
1. Yeni Vercel Project: **"New Project"**
2. Aynı GitHub repo'yu import et
3. Ayarlar:
   - **Project Name:** `bitki-admin`
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://bitki-project.onrender.com
   VITE_NODE_ENV=production
   VITE_ADMIN=true
   ```

5. Deploy

---

## 🔗 3. FINAL URL'LER

| Servis | URL | Açıklama |
|--------|-----|----------|
| **Backend API** | `https://bitki-project.onrender.com` | Render - Ücretsiz |
| **Public Site** | `https://bitki.vercel.app` | Vercel - Müşteri sitesi |
| **Admin Panel** | `https://bitki-admin.vercel.app` | Vercel - Admin paneli |

---

## 🛠️ 4. İLK KURULUM SONRASI

### Admin Hesabı Oluşturma
```bash
# Backend terminalinde (Render'da otomatik çalışacak)
node create-admin.js
```

**Admin Giriş Bilgileri:**
- Admin Code: `BITKI_ADMIN_2024`
- URL: `https://bitki-admin.vercel.app`

### Test İşlemleri
1. ✅ Public site açılıyor: `https://bitki.vercel.app`
2. ✅ Admin panel açılıyor: `https://bitki-admin.vercel.app`
3. ✅ API çalışıyor: `https://bitki-project.onrender.com/api/health`
4. ✅ Admin giriş yapabiliyor
5. ✅ Ürün ekleme/düzenleme çalışıyor
6. ✅ Dosya upload çalışıyor (persistent disk)

---

## 💰 **TOPLAM MALİYET: ₺0 (TAMAMEN ÜCRETSİZ)**

### Limitler:
- **Render:** 750 saat/ay (31 gün), 1GB disk
- **Vercel:** 100GB bandwidth/ay, sınırsız deployment
- **GitHub:** Sınırsız public repo

### Otomatik Deployment:
- Git push → Otomatik deploy (Vercel)
- Backend güncellemeleri → Otomatik restart (Render)

---

## 🔧 5. SORUN GİDERME

### Backend Sleep Sorunu (Render Free)
Render'da 30 dakika inaktiflik sonrası backend uyur. Çözüm:
```bash
# Cron job ile 25 dakikada bir ping at
# Vercel Functions ile ücretsiz keep-alive
```

### CORS Hataları
Backend `cors` ayarları doğru yapılandırıldı:
```javascript
cors({
  origin: [
    'https://bitki.vercel.app',
    'https://bitki-admin.vercel.app'
  ]
})
```

### Environment Variables
- Vercel: Project Settings → Environment Variables
- Render: Service → Environment

---

## 🚀 6. DEPLOYMENT KOMUTLARİ

### Tek Seferde Deploy
```bash
# Backend deploy (GitHub push yeterli)
git add .
git commit -m "Deploy to production"
git push origin main

# Frontend otomatik deploy olacak
```

### Manual Deploy
```bash
# Vercel CLI (opsiyonel)
npm i -g vercel
vercel --prod
```

---

**✅ DEPLOYMENT TAMAMLANDI!**

🌐 **Public Site:** https://bitki.vercel.app
🔐 **Admin Panel:** https://bitki-admin.vercel.app
🔧 **API Backend:** https://bitki-project.onrender.com