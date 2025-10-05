-- Migration: Add push_failures table for tracking failed push notifications
-- Date: 2025-10-05
-- Purpose: Log and track failed push notification attempts for debugging and monitoring

CREATE TABLE IF NOT EXISTS push_failures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL,
  error_code INTEGER,
  error_message TEXT,
  notification_id INTEGER,
  notification_title TEXT,
  notification_body TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notification_id) REFERENCES push_notifications(id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_push_failures_created_at ON push_failures(created_at);
CREATE INDEX IF NOT EXISTS idx_push_failures_endpoint ON push_failures(endpoint);
