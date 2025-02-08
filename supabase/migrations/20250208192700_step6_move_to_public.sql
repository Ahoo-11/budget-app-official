-- Step 6: Move all tables to public schema
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Move tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'budget') LOOP
        EXECUTE 'ALTER TABLE budget.' || quote_ident(r.tablename) || ' SET SCHEMA public';
    END LOOP;

    -- Move types
    FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'budget') LOOP
        EXECUTE 'ALTER TYPE budget.' || quote_ident(r.typname) || ' SET SCHEMA public';
    END LOOP;

    -- Drop the schema
    DROP SCHEMA IF EXISTS budget CASCADE;
END $$;
