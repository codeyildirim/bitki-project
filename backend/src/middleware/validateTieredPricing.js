/**
 * Validates tiered pricing data structure and business rules
 * Ensures data integrity before saving to database
 */
export const validateTieredPricing = (tiers) => {
  // Allow null/undefined (no tiered pricing)
  if (!tiers) {
    return { ok: true };
  }

  // Must be an array
  if (!Array.isArray(tiers)) {
    return { ok: false, message: 'tiered_pricing must be an array' };
  }

  // Empty array is valid
  if (tiers.length === 0) {
    return { ok: true };
  }

  const seenQuantities = new Set();

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];

    // Check tier structure
    if (!tier || typeof tier !== 'object') {
      return { ok: false, message: `Tier ${i + 1}: must be an object` };
    }

    // Validate quantity
    if (typeof tier.quantity !== 'number' || !Number.isInteger(tier.quantity)) {
      return { ok: false, message: `Tier ${i + 1}: quantity must be an integer` };
    }

    if (tier.quantity < 1) {
      return { ok: false, message: `Tier ${i + 1}: quantity must be ≥ 1` };
    }

    // Check for duplicate quantities
    if (seenQuantities.has(tier.quantity)) {
      return { ok: false, message: `Duplicate quantity: ${tier.quantity} appears multiple times` };
    }
    seenQuantities.add(tier.quantity);

    // Validate price
    if (typeof tier.price !== 'number') {
      return { ok: false, message: `Tier ${i + 1}: price must be a number` };
    }

    if (tier.price <= 0) {
      return { ok: false, message: `Tier ${i + 1}: price must be > 0` };
    }

    // Optional: Ensure price is reasonable (not too many decimal places)
    if (!Number.isFinite(tier.price)) {
      return { ok: false, message: `Tier ${i + 1}: price must be a finite number` };
    }
  }

  // Optional business rule: validate unit price decreases with higher quantities
  // (This encourages bulk discounts)
  const sortedTiers = [...tiers].sort((a, b) => a.quantity - b.quantity);
  for (let i = 1; i < sortedTiers.length; i++) {
    const prevUnitPrice = sortedTiers[i - 1].price / sortedTiers[i - 1].quantity;
    const currUnitPrice = sortedTiers[i].price / sortedTiers[i].quantity;

    if (currUnitPrice > prevUnitPrice) {
      console.warn(`[TIER WARNING] Higher quantity (${sortedTiers[i].quantity}) has higher unit price than lower quantity (${sortedTiers[i - 1].quantity})`);
      // Don't fail, just warn - allow flexibility
    }
  }

  return { ok: true };
};
