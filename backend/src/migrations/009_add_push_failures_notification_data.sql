-- Migration: Add notification_title and notification_body to push_failures table
-- Date: 2025-10-05
-- Purpose: Store notification content in failure logs for better debugging

-- Add notification_title column (if not exists)
ALTER TABLE push_failures ADD COLUMN notification_title TEXT;

-- Add notification_body column (if not exists)
ALTER TABLE push_failures ADD COLUMN notification_body TEXT;
