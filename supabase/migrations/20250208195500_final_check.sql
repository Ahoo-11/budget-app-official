-- Check policies
SELECT 'Policies in budget schema:' as info;
SELECT policyname, tablename, cmd
FROM pg_policies 
WHERE schemaname = 'budget';

-- Check functions
SELECT 'Functions in budget schema:' as info;
SELECT proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'budget';

-- Check views
SELECT 'Views in budget schema:' as info;
SELECT viewname
FROM pg_views
WHERE schemaname = 'budget';

-- Check triggers
SELECT 'Triggers in budget schema:' as info;
SELECT tgname as trigger_name, tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgrelid::regnamespace::name = 'budget';

-- Check types
SELECT 'Types in budget schema:' as info;
SELECT t.typname as type_name
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'budget';
