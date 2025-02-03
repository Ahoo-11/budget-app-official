-- Set the search path
SET search_path TO budget, public;

-- Create base tables
CREATE TABLE IF NOT EXISTS test_table (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA budget TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA budget TO authenticated;
