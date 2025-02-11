BEGIN;

-- Create user roles table if not exists
CREATE TABLE IF NOT EXISTS public.budgetapp_user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS to user_roles
ALTER TABLE public.budgetapp_user_roles ENABLE ROW LEVEL SECURITY;

-- Add policy for user_roles
CREATE POLICY "Users can view their own role"
    ON public.budgetapp_user_roles
    FOR SELECT
    USING (user_id = auth.uid());

-- Update sources table if needed
ALTER TABLE public.budgetapp_sources 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update sources RLS
DROP POLICY IF EXISTS "Users can view their own sources" ON public.budgetapp_sources;
CREATE POLICY "Users can view their own sources"
    ON public.budgetapp_sources
    FOR ALL
    USING (user_id = auth.uid());

COMMIT; 