# PWA Notification Permission System - Test Guide

## 🎯 Overview
This guide covers testing the new iOS/Android compatible push notification permission modal that was implemented.

---

## ✅ Test Scenarios

### 1. First Time User Flow (Happy Path)
**Steps:**
1. Open `https://bitki-project.vercel.app` in a fresh browser (clear cache)
2. Wait 3 seconds after page load
3. Notification permission modal should appear

**Expected Result:**
- ✅ Modal shows with Bell icon, green button
- ✅ Title: "📬 Yeni Ürünleri Kaçırma!"
- ✅ Description shows benefits of enabling notifications
- ✅ Two buttons: "Şimdi Değil" and "İzin Ver"

**User Action:** Click "İzin Ver"

**Expected Result:**
- ✅ Browser native permission prompt appears
- ✅ After granting permission: modal closes
- ✅ Success toast: "🔔 Bildirimler aktif edildi!"
- ✅ Push subscription created and sent to backend
- ✅ Console logs: "✅ Push subscription successful"

---

### 2. iOS Safari Specific Flow
**Test Device:** iPhone with iOS 16.4+ and Safari

**Steps:**
1. Open `https://bitki-project.vercel.app` in Safari
2. Wait 3 seconds

**Expected Result:**
- ✅ Modal detects iOS (checks `/iPad|iPhone|iPod/` user agent)
- ✅ Description shows iOS-specific text:
  - "🍏 iPhone'unuzda bildirimleri etkinleştirerek:"
  - "✨ Yeni ürün ve kampanyalardan haberdar olun"
  - "🎁 Özel indirimlerden ilk siz yararlanın"
- ✅ Blue info box appears:
  - "📱 iOS Kullanıcıları:"
  - "Safari bildirimleri destekliyor (iOS 16.4+)"

**User Action:** Click "İzin Ver"

**Expected Result (if user denies):**
- ✅ Toast shows: "📱 iOS Ayarlar > Safari > Bildirimler'den izin verin"
- ✅ Modal closes
- ✅ `notificationDeniedAt` saved to LocalStorage

---

### 3. User Denies Permission
**Steps:**
1. Open site, wait for modal
2. Click "Şimdi Değil" OR click close button (X)

**Expected Result:**
- ✅ Modal closes immediately
- ✅ `notificationDeniedAt` timestamp saved to LocalStorage
- ✅ Console log: "❌ User declined notification permission"

**Follow-up Test:**
1. Refresh the page immediately

**Expected Result:**
- ✅ Modal does NOT appear for 3 days
- ✅ Console log: "⏳ Waiting X more days before asking again"

---

### 4. User Already Granted Permission
**Steps:**
1. Grant notification permission once
2. Refresh the page

**Expected Result:**
- ✅ Modal does NOT appear at all
- ✅ Console log: "✅ Notification permission already granted"
- ✅ Push subscription automatically renewed (if needed)

---

### 5. Prompt Throttling (24-Hour Cooldown)
**Scenario:** User closes modal without denying explicitly

**Steps:**
1. Open site, modal appears
2. Close modal by clicking outside or using "Şimdi Değil"
3. Immediately refresh page

**Expected Result:**
- ✅ Modal does NOT appear
- ✅ `notificationPromptAt` timestamp saved to LocalStorage
- ✅ Console log: "⏳ Waiting X more hours before prompting again"

**Follow-up Test:**
1. Manually edit LocalStorage: set `notificationPromptAt` to 25 hours ago
2. Refresh page

**Expected Result:**
- ✅ Modal appears again (24-hour cooldown expired)

---

### 6. Push Notification Not Supported
**Test Devices:**
- Very old browsers (pre-2016)
- Private/Incognito mode in some browsers

**Expected Result:**
- ✅ Modal does NOT appear
- ✅ Console log: "🚫 Push not supported on this device"

---

### 7. Admin Dashboard - Active Subscriptions
**Steps:**
1. Login to admin panel: `https://bitki-admin.vercel.app`
2. Navigate to PWA Yönetimi

**Expected Result:**
- ✅ "Aktif Abonelikler" card displays count of active subscriptions
- ✅ "Bildirim Oranı" card shows percentage: `(activeSubscriptions / activeUsers) × 100%`
- ✅ Example: 50 active users, 30 subscriptions = 60% notification rate

**API Verification:**
```bash
# Check backend response
GET /api/pwa/stats
Authorization: Bearer <admin-token>

Expected JSON:
{
  "success": true,
  "data": {
    "totalInstalls": 120,
    "activeUsers": 50,
    "activeSubscriptions": 30,  // ← NEW FIELD
    "last30Days": [...],
    "deviceStats": [...]
  }
}
```

---

## 🔍 Technical Verification

### LocalStorage Keys
Open DevTools > Application > LocalStorage:

| Key | Value Example | Purpose |
|-----|---------------|---------|
| `notificationDeniedAt` | `1704678000000` | Timestamp when user denied permission |
| `notificationPromptAt` | `1704678000000` | Timestamp when modal was last shown |

### Service Worker Registration
Open DevTools > Application > Service Workers:

- ✅ Status: "activated and is running"
- ✅ Source: `/sw.js`
- ✅ Push subscription visible in browser DevTools

### Database Check (Backend)
```sql
-- Check active subscriptions
SELECT COUNT(*) FROM push_subscriptions WHERE is_active = 1;

-- Check subscription details
SELECT id, endpoint, device_info, created_at
FROM push_subscriptions
WHERE is_active = 1
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📱 Device-Specific Testing Matrix

| Device | Browser | iOS/Android Version | Expected Behavior |
|--------|---------|---------------------|-------------------|
| iPhone 14 | Safari | iOS 16.4+ | ✅ Full support with iOS-specific UI |
| iPhone 12 | Safari | iOS 15.x | ❌ Modal doesn't show (no push support) |
| Samsung Galaxy S23 | Chrome | Android 13 | ✅ Full support with generic UI |
| Pixel 7 | Chrome | Android 14 | ✅ Full support |
| iPad Pro | Safari | iPadOS 16.4+ | ✅ Full support (detected as iOS) |
| Desktop | Chrome | macOS/Windows | ✅ Full support with generic UI |
| Desktop | Firefox | macOS/Windows | ✅ Full support |

---

## 🐛 Common Issues & Solutions

### Issue: Modal doesn't appear on iOS
**Cause:** iOS version < 16.4
**Solution:** Check iOS version, inform user Safari push requires iOS 16.4+

### Issue: Permission prompt appears immediately without modal
**Cause:** Old code still in place
**Solution:** Verify `main.jsx` doesn't call `Notification.requestPermission()` on load

### Issue: Modal appears every time on page load
**Cause:** LocalStorage not persisting
**Solution:** Check browser privacy settings, ensure cookies/storage enabled

### Issue: Subscription not showing in admin panel
**Cause:** Backend API error or subscription failed
**Solution:** Check backend logs, verify `/api/pwa/subscribe` endpoint works

---

## 🎉 Success Criteria

### User Experience
- [ ] Modal appears after 3-second delay (first time users)
- [ ] Modal does NOT spam users (respects cooldowns)
- [ ] iOS users see iOS-specific messaging
- [ ] Success/error feedback via toasts
- [ ] Permission can be granted successfully
- [ ] Users can decline without being bothered for 3 days

### Technical
- [ ] Service worker registers successfully
- [ ] Push subscription created with VAPID keys
- [ ] Subscription sent to backend `/api/pwa/subscribe`
- [ ] Backend saves subscription with `is_active = 1`
- [ ] Admin dashboard shows correct subscription count
- [ ] Notification rate percentage calculated correctly

### Admin Metrics
- [ ] "Aktif Abonelikler" card displays count
- [ ] "Bildirim Oranı" card shows percentage
- [ ] Metrics update in real-time when new subscriptions added

---

## 📊 Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| Modal load time | < 100ms | TBD |
| Permission grant → subscription | < 2s | TBD |
| Backend subscription save | < 500ms | TBD |
| Admin stats API response | < 1s | TBD |

---

## 🔐 Security Checklist

- [x] No sensitive data stored in LocalStorage
- [x] VAPID keys loaded from environment variables
- [x] Push subscription endpoint uses HTTPS
- [x] Backend validates subscription format before saving
- [x] Admin API requires authentication to view stats

---

## 📝 Next Steps

1. **Manual Testing:**
   - Test on real iOS device (iPhone with iOS 16.4+)
   - Test on Android device (Chrome browser)
   - Test denial cooldown logic
   - Test 24-hour prompt throttling

2. **Production Verification:**
   - Deploy to Vercel
   - Monitor admin dashboard for subscription count
   - Send test push notification to verify end-to-end flow

3. **Future Enhancements:**
   - Add A/B testing for modal copy
   - Add analytics tracking (modal shown, permission granted/denied)
   - Add "Enable Notifications" button in user profile settings
   - Add notification preferences (product updates, promotions, etc.)

---

**Created:** 2025-10-05
**Author:** Claude Code
**Version:** 1.0
