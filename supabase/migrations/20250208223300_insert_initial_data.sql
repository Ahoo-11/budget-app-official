-- Insert initial profile for controller
INSERT INTO public.budgetapp_profiles (id, email, status, display_name)
VALUES (
  'ccdfa137-c40d-4895-b9da-db3565af11af',
  'ahoo11official@gmail.com',
  'approved',
  'ahoo11official@gmail.com'
) ON CONFLICT (id) DO UPDATE 
SET status = 'approved',
    display_name = EXCLUDED.display_name;

-- Set user role as controller
INSERT INTO public.budgetapp_user_roles (user_id, role)
VALUES (
  'ccdfa137-c40d-4895-b9da-db3565af11af',
  'controller'
) ON CONFLICT (user_id) DO UPDATE 
SET role = 'controller';

-- Create an initial source
INSERT INTO public.budgetapp_sources (name, created_by)
VALUES (
  'Main Budget',
  'ccdfa137-c40d-4895-b9da-db3565af11af'
) ON CONFLICT DO NOTHING;
