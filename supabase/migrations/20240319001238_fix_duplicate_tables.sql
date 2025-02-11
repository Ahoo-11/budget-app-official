BEGIN;

-- 1. First check if data exists in old tables and move it
INSERT INTO public.budgetapp_categories (id, name, parent_id, source_id)
SELECT id, name, parent_id, source_id 
FROM public.categories
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.budgetapp_source_permissions (id, source_id, user_id, can_view, can_edit, can_create, can_delete)
SELECT id, source_id, user_id, can_view, can_edit, can_create, can_delete
FROM public.source_permissions
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.budgetapp_sources (id, name, user_id, created_at)
SELECT id, name, user_id, created_at
FROM public.sources
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.budgetapp_user_roles (id, user_id, role, created_at, updated_at)
SELECT id, user_id, role, created_at, updated_at
FROM public.user_roles
ON CONFLICT (id) DO NOTHING;

-- 2. Verify RLS is enabled on new tables
ALTER TABLE public.budgetapp_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_source_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Add RLS policies to new tables
CREATE POLICY "Users can view their own categories"
    ON public.budgetapp_categories
    FOR ALL
    USING (source_id IN (
        SELECT source_id FROM public.budgetapp_source_permissions 
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view their own sources"
    ON public.budgetapp_sources
    FOR ALL
    USING (id IN (
        SELECT source_id FROM public.budgetapp_source_permissions 
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their permissions"
    ON public.budgetapp_source_permissions
    FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can view their roles"
    ON public.budgetapp_user_roles
    FOR ALL
    USING (user_id = auth.uid());

-- 4. Drop old tables (only after confirming data is migrated)
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.source_permissions CASCADE;
DROP TABLE IF EXISTS public.sources CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

COMMIT; 