-- Ensure the correct function exists for username lookup
DROP FUNCTION IF EXISTS get_user_email_by_username(VARCHAR);

CREATE OR REPLACE FUNCTION get_user_email_by_username(p_username VARCHAR)
RETURNS TABLE(email VARCHAR) 
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT email FROM users WHERE LOWER(username) = LOWER(p_username) LIMIT 1;
$$;

-- Grant permission for unauthenticated users to call this function
GRANT EXECUTE ON FUNCTION get_user_email_by_username(VARCHAR) TO anon;
