-- Migration: Add push_failures table for tracking failed push notifications
-- Date: 2025-10-05
-- Purpose: Log and track failed push notification attempts for debugging and monitoring

BEGIN TRANSACTION;

-- Tablonun var olup olmadığını kontrol et, yoksa oluştur
CREATE TABLE IF NOT EXISTS push_failures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL,
  error_code INTEGER,
  error_message TEXT,
  notification_id INTEGER,
  retry_count INTEGER DEFAULT 0,
  notification_title TEXT,
  notification_body TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notification_id) REFERENCES push_notifications(id)
);

-- İndeksler de varsa kontrol et, yoksa ekle
CREATE INDEX IF NOT EXISTS idx_push_failures_created_at ON push_failures(created_at);
CREATE INDEX IF NOT EXISTS idx_push_failures_endpoint ON push_failures(endpoint);

COMMIT;
