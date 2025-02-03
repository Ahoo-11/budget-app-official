-- Create extensions in public schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Initial setup
BEGIN;

-- Create budget schema
CREATE SCHEMA IF NOT EXISTS budget;

-- Set search path
SET search_path TO budget, public;

-- Create initial test table
CREATE TABLE IF NOT EXISTS test_table (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Grant basic permissions
GRANT USAGE ON SCHEMA budget TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA budget TO postgres, anon, authenticated, service_role;

COMMIT;
