-- Fix table names to add budgetapp_ prefix
DO $$ 
BEGIN
    -- Rename tables if they exist
    ALTER TABLE IF EXISTS public.user_roles RENAME TO budgetapp_user_roles;
    ALTER TABLE IF EXISTS public.sources RENAME TO budgetapp_sources;
    ALTER TABLE IF EXISTS public.categories RENAME TO budgetapp_categories;
    ALTER TABLE IF EXISTS public.source_permissions RENAME TO budgetapp_source_permissions;

    -- Update foreign key references
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'budgetapp_categories') THEN
        ALTER TABLE public.budgetapp_categories 
        DROP CONSTRAINT IF EXISTS categories_source_id_fkey,
        ADD CONSTRAINT categories_source_id_fkey 
        FOREIGN KEY (source_id) 
        REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'budgetapp_source_permissions') THEN
        ALTER TABLE public.budgetapp_source_permissions 
        DROP CONSTRAINT IF EXISTS source_permissions_source_id_fkey,
        ADD CONSTRAINT source_permissions_source_id_fkey 
        FOREIGN KEY (source_id) 
        REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE;
    END IF;

    -- Update policies
    DROP POLICY IF EXISTS "Users can view sources they have access to" ON public.budgetapp_sources;
    CREATE POLICY "Users can view sources they have access to" 
    ON public.budgetapp_sources
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.budgetapp_source_permissions 
            WHERE source_id = budgetapp_sources.id 
            AND user_id = auth.uid()
        )
    );

    DROP POLICY IF EXISTS "Users can view categories they have access to" ON public.budgetapp_categories;
    CREATE POLICY "Users can view categories they have access to" 
    ON public.budgetapp_categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.budgetapp_sources s
            LEFT JOIN public.budgetapp_source_permissions sp ON s.id = sp.source_id
            WHERE s.id = budgetapp_categories.source_id
            AND (s.user_id = auth.uid() OR sp.user_id = auth.uid())
        )
    );
END $$;
