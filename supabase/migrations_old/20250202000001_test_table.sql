-- Create a test table using the UUID extension
CREATE TABLE IF NOT EXISTS budget.test_table (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
