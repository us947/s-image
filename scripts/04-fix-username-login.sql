-- Create a public function to get user email by username
-- This function can be called without authentication
CREATE OR REPLACE FUNCTION get_user_email_by_username(p_username VARCHAR)
RETURNS TABLE(email VARCHAR) 
LANGUAGE sql
STABLE
AS $$
  SELECT email FROM users WHERE username = LOWER(p_username) LIMIT 1;
$$;

-- Grant permission for unauthenticated users to call this function
GRANT EXECUTE ON FUNCTION get_user_email_by_username(VARCHAR) TO anon;
