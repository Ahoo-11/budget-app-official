-- Add display_name column to profiles if it doesn't exist
ALTER TABLE budget.profiles
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Function to generate display name from email
CREATE OR REPLACE FUNCTION budget.generate_display_name(email TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN split_part(email, '@', 1);
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user trigger to include display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO budget.profiles (id, email, status, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    'pending',
    budget.generate_display_name(NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles to have display_name if they don't
UPDATE budget.profiles
SET display_name = budget.generate_display_name(email)
WHERE display_name IS NULL;

-- Ensure controller account exists and has correct role
DO $$
DECLARE
  controller_id UUID;
BEGIN
  -- Get the user ID for the controller email
  SELECT id INTO controller_id
  FROM auth.users
  WHERE email = 'ahoo11official@gmail.com';

  -- If controller exists, ensure they have correct role and status
  IF controller_id IS NOT NULL THEN
    -- Ensure profile exists
    INSERT INTO budget.profiles (id, email, status, display_name)
    VALUES (
      controller_id,
      'ahoo11official@gmail.com',
      'approved',
      'ahoo11official'
    )
    ON CONFLICT (id) DO UPDATE
    SET status = 'approved',
        display_name = COALESCE(budget.profiles.display_name, 'ahoo11official');

    -- Ensure controller role
    INSERT INTO budget.user_roles (user_id, role)
    VALUES (controller_id, 'controller')
    ON CONFLICT (user_id) DO UPDATE
    SET role = 'controller';
  END IF;
END $$;
