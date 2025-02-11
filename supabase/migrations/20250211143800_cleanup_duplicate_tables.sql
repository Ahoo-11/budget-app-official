BEGIN;

-- 0. First check if the table exists and create if needed
CREATE TABLE IF NOT EXISTS public.budgetapp_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    source_id UUID REFERENCES public.budgetapp_sources(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Move any remaining data from old tables
INSERT INTO public.budgetapp_categories (id, name, source_id)
SELECT id, name, source_id 
FROM public.categories
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.budgetapp_sources (id, name, user_id, created_at)
SELECT id, name, user_id, created_at
FROM public.sources
ON CONFLICT (id) DO NOTHING;

-- 2. Verify data is moved
DO $$
DECLARE
    old_count int;
    new_count int;
BEGIN
    SELECT COUNT(*) INTO old_count FROM public.categories;
    SELECT COUNT(*) INTO new_count FROM public.budgetapp_categories;
    IF old_count > new_count THEN
        RAISE EXCEPTION 'Data migration incomplete for categories';
    END IF;

    SELECT COUNT(*) INTO old_count FROM public.sources;
    SELECT COUNT(*) INTO new_count FROM public.budgetapp_sources;
    IF old_count > new_count THEN
        RAISE EXCEPTION 'Data migration incomplete for sources';
    END IF;
END $$;

-- 3. Drop old tables if verification passes
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.sources CASCADE;

-- Drop duplicate tables without prefix
DROP TABLE IF EXISTS public.source_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Verify all references are using budgetapp_ prefixed tables
DO $$ 
BEGIN
    -- Update any remaining foreign key constraints if they exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'categories_source_id_fkey'
    ) THEN
        ALTER TABLE public.budgetapp_categories 
        DROP CONSTRAINT IF EXISTS categories_source_id_fkey,
        ADD CONSTRAINT budgetapp_categories_source_id_fkey 
        FOREIGN KEY (source_id) 
        REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'source_permissions_source_id_fkey'
    ) THEN
        ALTER TABLE public.budgetapp_source_permissions 
        DROP CONSTRAINT IF EXISTS source_permissions_source_id_fkey,
        ADD CONSTRAINT budgetapp_source_permissions_source_id_fkey 
        FOREIGN KEY (source_id) 
        REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE;
    END IF;
END $$;

COMMIT; 