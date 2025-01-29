-- Backup of current schema and data as of 2025-01-25

-- List all tables and their columns
SELECT 
    t.table_schema,
    t.table_name,
    c.column_name,
    c.data_type,
    c.column_default,
    c.is_nullable
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_schema = c.table_schema 
    AND t.table_name = c.table_name
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- Get all table definitions
SELECT 
    'CREATE TABLE ' || tablename || ' (' ||
    string_agg(
        column_name || ' ' ||  type || ' '|| 
        CASE WHEN column_default IS NOT NULL 
            THEN 'DEFAULT '|| column_default 
            ELSE '' 
        END ||
        CASE WHEN is_nullable = 'NO' 
            THEN ' NOT NULL' 
            ELSE '' 
        END,
        ', '
    ) || ');' as create_statement
FROM (
    SELECT 
        c.relname AS tablename,
        a.attname AS column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as type,
        (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
         FROM pg_catalog.pg_attrdef d
         WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef) as column_default,
        CASE WHEN a.attnotnull THEN 'NO' ELSE 'YES' END as is_nullable
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_attribute a ON c.oid = a.attrelid
    WHERE c.relkind = 'r'
    AND a.attnum > 0
    AND NOT a.attisdropped
    AND c.relnamespace = (SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = 'public')
) AS cols
GROUP BY tablename;

-- Get all RLS Policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public';

-- Get all Functions
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    l.lanname as function_language,
    CASE WHEN l.lanname = 'internal' THEN p.prosrc
         ELSE pg_get_functiondef(p.oid)
    END as definition,
    p.prorettype::regtype as return_type
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public';

-- Get all Indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public';

-- Get all Triggers
SELECT 
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Get all Grants/Permissions
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public';
