-- Migration: Add discount_badges column to products table
-- Date: 2025-10-05
-- Purpose: Enable automatic discount percentage calculation and badge display for tiered pricing

-- Add discount_badges column (boolean) to control whether to show discount labels
ALTER TABLE products ADD COLUMN discount_badges INTEGER DEFAULT 0;

-- Comment: 0 = disabled, 1 = enabled (SQLite uses INTEGER for boolean)
