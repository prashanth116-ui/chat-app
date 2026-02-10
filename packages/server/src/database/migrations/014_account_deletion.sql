-- Add account deletion columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP;

-- Create index for scheduled deletions
CREATE INDEX IF NOT EXISTS idx_users_deletion_scheduled ON users(deletion_scheduled_at)
WHERE deletion_scheduled_at IS NOT NULL;
