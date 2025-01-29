-- Test access to budget_app schema directly
-- This migration doesn't drop anything, just adds test functions

-- 1. Test function to verify direct schema access
CREATE OR REPLACE FUNCTION budget_app.test_schema_access()
RETURNS TABLE (
    schema_name text,
    table_name text,
    row_count bigint
) 
SECURITY DEFINER
SET search_path = budget_app
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH table_counts AS (
        SELECT 
            'sources' as tname, 
            (SELECT COUNT(*) FROM budget_app.sources) as cnt
        UNION ALL
        SELECT 
            'bills', 
            (SELECT COUNT(*) FROM budget_app.bills)
        UNION ALL
        SELECT 
            'products', 
            (SELECT COUNT(*) FROM budget_app.products)
        UNION ALL
        SELECT 
            'income_entries', 
            (SELECT COUNT(*) FROM budget_app.income_entries)
    )
    SELECT 
        'budget_app'::text,
        tc.tname::text,
        tc.cnt::bigint
    FROM table_counts tc;
END;
$$;

-- 2. Test function to compare data between schemas
CREATE OR REPLACE FUNCTION budget_app.verify_schema_data()
RETURNS TABLE (
    table_name text,
    public_count bigint,
    budget_app_count bigint,
    matches boolean
) 
SECURITY DEFINER
SET search_path = budget_app
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'sources'::text as table_name,
        (SELECT COUNT(*)::bigint FROM public.sources) as public_count,
        (SELECT COUNT(*)::bigint FROM budget_app.sources) as budget_app_count,
        (SELECT COUNT(*)::bigint FROM public.sources) = (SELECT COUNT(*)::bigint FROM budget_app.sources) as matches
    UNION ALL
    SELECT 
        'bills'::text,
        (SELECT COUNT(*)::bigint FROM public.bills),
        (SELECT COUNT(*)::bigint FROM budget_app.bills),
        (SELECT COUNT(*)::bigint FROM public.bills) = (SELECT COUNT(*)::bigint FROM budget_app.bills)
    UNION ALL
    SELECT 
        'products'::text,
        (SELECT COUNT(*)::bigint FROM public.products),
        (SELECT COUNT(*)::bigint FROM budget_app.products),
        (SELECT COUNT(*)::bigint FROM public.products) = (SELECT COUNT(*)::bigint FROM budget_app.products)
    UNION ALL
    SELECT 
        'income_entries'::text,
        (SELECT COUNT(*)::bigint FROM public.income_entries),
        (SELECT COUNT(*)::bigint FROM budget_app.income_entries),
        (SELECT COUNT(*)::bigint FROM public.income_entries) = (SELECT COUNT(*)::bigint FROM budget_app.income_entries);
END;
$$;

-- How to test:
COMMENT ON FUNCTION budget_app.test_schema_access IS 
$doc$
Test direct access to budget_app schema:
SELECT * FROM budget_app.test_schema_access();

Test data consistency between schemas:
SELECT * FROM budget_app.verify_schema_data();
$doc$;
