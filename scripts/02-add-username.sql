-- Add username column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add a function to handle login with either email or username
CREATE OR REPLACE FUNCTION get_user_by_email_or_username(identifier VARCHAR)
RETURNS TABLE (id UUID, email VARCHAR, username VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.username
  FROM users u
  WHERE u.email = identifier OR u.username = identifier
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
