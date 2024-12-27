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

-- Reset permissions for proactivepixel@gmail.com (if they need specific source access)
DO $$
DECLARE
  v_user_id uuid;
  v_source_id uuid;
BEGIN
  -- Get user ID for proactivepixel@gmail.com
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = 'proactivepixel@gmail.com';

  -- Get the source ID for 'Huvaa'
  SELECT id INTO v_source_id
  FROM sources
  WHERE name = 'Huvaa';

  -- Delete existing permissions
  DELETE FROM source_permissions
  WHERE user_id = v_user_id;

  -- Add specific source permission
  IF v_source_id IS NOT NULL THEN
    INSERT INTO source_permissions (user_id, source_id, can_view, can_create, can_edit, can_delete)
    VALUES (v_user_id, v_source_id, true, true, true, true);
  END IF;
END $$;
