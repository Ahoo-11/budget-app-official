-- Update the has_full_access function to only consider controller role
CREATE OR REPLACE FUNCTION has_full_access(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = $1 
    AND user_roles.role = 'controller'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
