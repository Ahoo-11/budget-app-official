-- Create income_entries table
CREATE TABLE IF NOT EXISTS income_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    income_type_id UUID REFERENCES income_types(id),
    subcategory_id UUID REFERENCES income_subcategories(id),
    name VARCHAR(255) NOT NULL,
    remarks TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    tags TEXT[],
    photo_url TEXT,
    -- Product-specific fields
    current_stock INTEGER,
    minimum_stock INTEGER,
    unit_of_measure VARCHAR(50),
    -- Common fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read income entries from sources they have access to
CREATE POLICY "Users can read income entries from their sources" ON income_entries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM source_users su
            WHERE su.source_id = income_entries.source_id
            AND su.user_id = auth.uid()
        )
    );

-- Policy to allow users to insert income entries to sources they have access to
CREATE POLICY "Users can insert income entries to their sources" ON income_entries
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM source_users su
            WHERE su.source_id = income_entries.source_id
            AND su.user_id = auth.uid()
            AND su.role IN ('admin', 'manager')
        )
    );

-- Policy to allow users to update income entries in their sources
CREATE POLICY "Users can update income entries in their sources" ON income_entries
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM source_users su
            WHERE su.source_id = income_entries.source_id
            AND su.user_id = auth.uid()
            AND su.role IN ('admin', 'manager')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM source_users su
            WHERE su.source_id = income_entries.source_id
            AND su.user_id = auth.uid()
            AND su.role IN ('admin', 'manager')
        )
    );

-- Policy to allow users to delete income entries in their sources
CREATE POLICY "Users can delete income entries in their sources" ON income_entries
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM source_users su
            WHERE su.source_id = income_entries.source_id
            AND su.user_id = auth.uid()
            AND su.role IN ('admin', 'manager')
        )
    );

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_income_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_income_entries_updated_at
    BEFORE UPDATE ON income_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_income_entries_updated_at();
