-- First, let's check what tables we're missing
DO $$ 
DECLARE
    missing_tables text;
BEGIN
    SELECT string_agg(table_name, ', ')
    INTO missing_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT IN ('measurement_units', 'sources', 'products', 'recipe_ingredients');
    
    RAISE NOTICE 'Missing tables: %', missing_tables;
END $$;

-- Create views for bills and related tables
CREATE VIEW public.bills AS SELECT * FROM budget_app.bills;
CREATE VIEW public.income_entries AS SELECT * FROM budget_app.income_entries;
CREATE VIEW public.income_types AS SELECT * FROM budget_app.income_types;
CREATE VIEW public.source_payer_settings AS SELECT * FROM budget_app.source_payer_settings;
CREATE VIEW public.source_permissions AS SELECT * FROM budget_app.source_permissions;
CREATE VIEW public.source_templates AS SELECT * FROM budget_app.source_templates;
CREATE VIEW public.audit_logs AS SELECT * FROM budget_app.audit_logs;

-- Grant permissions on new views
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.income_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.income_types TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.source_payer_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.source_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.source_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO authenticated;

GRANT SELECT ON public.bills TO anon;
GRANT SELECT ON public.income_entries TO anon;
GRANT SELECT ON public.income_types TO anon;
GRANT SELECT ON public.source_payer_settings TO anon;
GRANT SELECT ON public.source_permissions TO anon;
GRANT SELECT ON public.source_templates TO anon;
GRANT SELECT ON public.audit_logs TO anon;
