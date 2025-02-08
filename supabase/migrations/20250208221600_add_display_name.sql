-- Add display_name to budgetapp_profiles
ALTER TABLE public.budgetapp_profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing profiles to use email as display_name if it's null
UPDATE public.budgetapp_profiles
SET display_name = email
WHERE display_name IS NULL;
