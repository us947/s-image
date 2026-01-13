-- Add security-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);
