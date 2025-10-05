# Tiered Pricing E2E Test Guide

## 📋 Overview
This document outlines comprehensive end-to-end testing procedures for the multi-tier pricing system, including validation, discount calculation, and cart integration.

---

## 🧪 Test Scenarios

### 1. Basic Tier Creation (Admin Panel)

**Location**: https://bitki-admin.vercel.app/products

**Steps**:
1. Login to admin panel
2. Click "[+] Yeni Ürün"
3. Fill basic product info:
   - Name: "Adaçayı Paketi"
   - Description: "Organik adaçayı..."
   - Base Price: 200 TL
   - Stock: 100
   - Category: Any
4. Enable "Çoklu Paket Fiyatlandırma"
5. Add tiers:
   - 1 paket = 200 TL
   - 3 paket = 500 TL
   - 6 paket = 900 TL
6. Click "Kaydet"

**Expected Result**:
- Product created successfully
- Tiers saved to database
- Unit prices displayed: ≈ 200 ₺/paket, ≈ 166.67 ₺/paket, ≈ 150 ₺/paket

---

### 2. Tier Validation Tests

**Test Case 2.1: Duplicate Quantity**
- Try to add two tiers with quantity = 3
- **Expected**: Error message "Duplicate quantity: 3 appears multiple times"

**Test Case 2.2: Invalid Quantity**
- Try quantity = 0 or negative
- **Expected**: Error message "quantity must be ≥ 1"

**Test Case 2.3: Invalid Price**
- Try price = 0 or negative
- **Expected**: Error message "price must be > 0"

**Test Case 2.4: Non-Integer Quantity**
- Try quantity = 2.5
- **Expected**: Error message "quantity must be an integer"

---

### 3. Discount Badge Activation

**Steps**:
1. Edit product with tiers
2. Scroll to "🏷️ Kampanya Etiketleri"
3. Click "[ON] Açık" to enable
4. Save product

**Expected Result**:
- discount_badges = 1 in database
- Public site will show discount badges

---

### 4. Public Site Display Test

**Location**: https://bitki-project.vercel.app/products/[id]

**Steps**:
1. Navigate to product detail page
2. Observe tier selector cards

**Expected Result**:
- 3 cards displayed in grid (2 cols on mobile, 3 on desktop)
- Each card shows:
  - Quantity (e.g., "3 Paket")
  - Total price (e.g., "500 ₺")
  - Unit price (e.g., "~166.67 ₺ / paket")
- If discount badges enabled:
  - Red badge on top-right: "%17 Tasarruf" (for 3-pack)
  - "%25 Tasarruf" (for 6-pack)

---

### 5. Discount Calculation Verification

**Formula**: `discount = 100 - (tier.price / (base_price × quantity)) × 100`

**Test Data**:
| Tier | Base Price | Quantity | Tier Price | Expected Price | Actual Discount | Expected Discount |
|------|-----------|----------|------------|----------------|-----------------|-------------------|
| 1    | 200       | 1        | 200        | 200            | 0%              | 0%                |
| 3    | 200       | 3        | 500        | 600            | 17%             | 17%               |
| 6    | 200       | 6        | 900        | 1200           | 25%             | 25%               |

**Verification**:
1. Check API response: `GET /api/products/:id`
2. Verify `tiered_pricing` array contains `discount` field
3. Confirm discount values match expected percentages

---

### 6. Tier Selection & Price Update

**Steps**:
1. On product detail page, click "3 Paket" card
2. Observe price display

**Expected Result**:
- Card highlighted with green border + ring effect
- Main price updates to: **500 ₺**
- Card shows: "~166.67 ₺ / paket"

---

### 7. Cart Integration Test

**Steps**:
1. Select tier (e.g., 3 paket = 500 TL)
2. Set quantity = 2 (buying 2 sets of 3-pack)
3. Click "Sepete Ekle"
4. Check cart

**Expected Result**:
- Cart shows: 2 items
- Total: 500 × 2 = **1000 TL**
- **IMPORTANT**: Price should be calculated server-side, not client-side

---

### 8. Server-Side Price Verification

**Location**: `backend/src/controllers/orders.js` (or cart controller)

**Required Implementation**:
```javascript
// When creating order from cart:
const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
const tiers = product.tiered_pricing ? JSON.parse(product.tiered_pricing) : null;

// Find matching tier
const selectedTier = tiers?.find(t => t.quantity === requestedTierQuantity);
const pricePerTier = selectedTier ? selectedTier.price : product.price;

// Calculate total (NEVER trust client price)
const total = pricePerTier * quantity;
```

**Test**:
- Modify client-side to send wrong price
- **Expected**: Server recalculates correct price from database

---

### 9. Tier Update Propagation

**Steps**:
1. Admin: Update tier (3 paket → 510 TL instead of 500)
2. Save product
3. Public site: Refresh product page

**Expected Result**:
- Price updates to 510 TL
- Discount recalculates: 100 - (510/600) × 100 = **15%**
- Badge shows: "%15 Tasarruf"

---

### 10. Mobile Responsiveness

**Devices to Test**:
- iPhone SE (375px width)
- iPhone 12 Pro (390px width)
- iPad (768px width)

**Expected Result**:
- Tier cards: 2 columns on mobile, 3 on tablet+
- Badge: Visible at `top-1.5 right-1.5` (not cut off)
- Text readable, no overflow
- Touch targets ≥ 44px × 44px

---

### 11. Empty State Tests

**Test Case 11.1: No Tiers**
- Product with `tiered_pricing = null`
- **Expected**: Only base price shown, no tier selector

**Test Case 11.2: Empty Tiers Array**
- Product with `tiered_pricing = []`
- **Expected**: Same as above

---

### 12. Edge Cases

**Test Case 12.1: Large Quantities**
- Try quantity = 1000
- **Expected**: Works, shows correct unit price

**Test Case 12.2: Decimal Prices**
- Base price: 199.99 TL
- Tier price: 549.99 TL
- **Expected**: Discount calculates correctly (no floating point errors)

**Test Case 12.3: Same Unit Price**
- 1 paket = 200 TL (200 ₺/paket)
- 3 paket = 600 TL (200 ₺/paket)
- **Expected**: 0% discount shown (no badge)

---

## 🔒 Security Checklist

- [ ] Server validates all tier data before saving
- [ ] Client cannot manipulate prices sent to backend
- [ ] Order total calculated server-side only
- [ ] No SQL injection possible in tier quantity/price
- [ ] Discount percentage displayed as integer (no XSS via tier.discount)

---

## 📊 Performance Benchmarks

| Metric | Target | Test Method |
|--------|--------|-------------|
| Tier calculation time | < 50ms | Backend response time |
| UI rendering | < 100ms | React DevTools Profiler |
| API response size | < 5KB | Network tab (product detail) |
| Mobile FCP | < 2s | Lighthouse |

---

## 🐛 Known Issues / Future Improvements

1. **Tier sorting**: Currently sorts in admin UI, but could enforce in DB query
2. **Bulk actions**: No bulk tier update feature yet
3. **Analytics**: Track which tiers are most popular
4. **A/B Testing**: Test different tier combinations for conversion

---

## 📞 Contact

For bugs or questions:
- GitHub Issues: [bitki-project/issues](https://github.com/codeyildirim/bitki-project/issues)
- Developer: Claude Code

---

**Last Updated**: 2025-10-05
**Version**: 1.0
