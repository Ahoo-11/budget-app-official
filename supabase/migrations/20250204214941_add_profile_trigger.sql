-- Drop unnecessary users table if it exists
DROP TABLE IF EXISTS budget.users CASCADE;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile for the new user
  INSERT INTO budget.profiles (id, email, status)
  VALUES (NEW.id, NEW.email, 'pending');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to fire on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Handle existing users that might not have profiles
INSERT INTO budget.profiles (id, email, status)
SELECT au.id, au.email, 'pending'
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM budget.profiles bp 
    WHERE bp.id = au.id
);
