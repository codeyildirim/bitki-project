-- Migration: Add tiered_pricing column to products table
-- Date: 2025-10-05
-- Purpose: Enable multi-tier pricing (e.g., 1 pack = 200 TL, 3 packs = 500 TL, 6 packs = 900 TL)

-- Add tiered_pricing column to store pricing tiers as JSON
ALTER TABLE products ADD COLUMN tiered_pricing TEXT;

-- Example structure: [{"quantity": 1, "price": 200}, {"quantity": 3, "price": 500}, {"quantity": 6, "price": 900}]
