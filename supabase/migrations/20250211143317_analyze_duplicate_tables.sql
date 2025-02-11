-- Check tables and their properties
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'categories',
    'source_permissions',
    'sources',
    'user_roles',
    'budgetapp_categories',
    'budgetapp_source_permissions',
    'budgetapp_sources',
    'budgetapp_user_roles'
);

-- Check existing policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'categories',
    'source_permissions',
    'sources',
    'user_roles',
    'budgetapp_categories',
    'budgetapp_source_permissions',
    'budgetapp_sources',
    'budgetapp_user_roles'
);
