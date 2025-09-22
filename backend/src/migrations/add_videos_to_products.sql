-- Migration: Add video support to products table
-- Description: Adds a videos column to store JSON array of video URLs

-- Add videos column to products table
ALTER TABLE products ADD COLUMN videos TEXT;

-- Add comment to describe the column
-- videos: JSON array of video URLs/paths for the product

-- Example data structure for videos column:
-- ["uploads/videos/product_123_video1.mp4", "uploads/videos/product_123_video2.webm"]