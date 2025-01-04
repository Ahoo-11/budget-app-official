-- Create income_types table
CREATE TABLE IF NOT EXISTS income_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create income_type_settings table (for per-source settings)
CREATE TABLE IF NOT EXISTS income_type_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    income_type_id UUID REFERENCES income_types(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(source_id, income_type_id)
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS income_subcategories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    income_type_id UUID REFERENCES income_types(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add new columns to products table
ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS income_type_id UUID REFERENCES income_types(id),
    ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES income_subcategories(id),
    ADD COLUMN IF NOT EXISTS minimum_stock INTEGER,
    ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(50),
    ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS tags TEXT[],
    ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Insert default income types
INSERT INTO income_types (name, description) VALUES
    ('Employment Income', 'Income from employment including salary, bonuses, and commissions'),
    ('Service Income', 'Income from providing services'),
    ('Product Sales', 'Income from selling products'),
    ('Investment Income', 'Income from investments'),
    ('Rental Income', 'Income from renting properties or equipment'),
    ('Royalties', 'Income from intellectual property rights'),
    ('Gifts and Grants', 'Income from gifts, grants, and donations'),
    ('Other Income', 'Miscellaneous income sources');

-- Insert subcategories for each income type
DO $$ 
DECLARE 
    employment_id UUID;
    service_id UUID;
    product_id UUID;
    investment_id UUID;
    rental_id UUID;
    royalties_id UUID;
    gifts_id UUID;
    other_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO employment_id FROM income_types WHERE name = 'Employment Income';
    SELECT id INTO service_id FROM income_types WHERE name = 'Service Income';
    SELECT id INTO product_id FROM income_types WHERE name = 'Product Sales';
    SELECT id INTO investment_id FROM income_types WHERE name = 'Investment Income';
    SELECT id INTO rental_id FROM income_types WHERE name = 'Rental Income';
    SELECT id INTO royalties_id FROM income_types WHERE name = 'Royalties';
    SELECT id INTO gifts_id FROM income_types WHERE name = 'Gifts and Grants';
    SELECT id INTO other_id FROM income_types WHERE name = 'Other Income';

    -- Employment Income subcategories
    INSERT INTO income_subcategories (income_type_id, name) VALUES
        (employment_id, 'Salary'),
        (employment_id, 'Bonuses'),
        (employment_id, 'Commissions'),
        (employment_id, 'Overtime Pay'),
        (employment_id, 'Tips'),
        (employment_id, 'Allowances');

    -- Service Income subcategories
    INSERT INTO income_subcategories (income_type_id, name) VALUES
        (service_id, 'Consulting'),
        (service_id, 'Freelancing'),
        (service_id, 'Professional Services'),
        (service_id, 'Transportation Services');

    -- Product Sales subcategories
    INSERT INTO income_subcategories (income_type_id, name) VALUES
        (product_id, 'Retail Sales'),
        (product_id, 'Wholesale Sales'),
        (product_id, 'Online Sales');

    -- Investment Income subcategories
    INSERT INTO income_subcategories (income_type_id, name) VALUES
        (investment_id, 'Dividends'),
        (investment_id, 'Interest'),
        (investment_id, 'Capital Gains'),
        (investment_id, 'Business Funding');

    -- Rental Income subcategories
    INSERT INTO income_subcategories (income_type_id, name) VALUES
        (rental_id, 'Residential Rent'),
        (rental_id, 'Commercial Rent'),
        (rental_id, 'Equipment Rent');

    -- Royalties subcategories
    INSERT INTO income_subcategories (income_type_id, name) VALUES
        (royalties_id, 'Book Royalties'),
        (royalties_id, 'Patent Royalties'),
        (royalties_id, 'Music Royalties');

    -- Gifts and Grants subcategories
    INSERT INTO income_subcategories (income_type_id, name) VALUES
        (gifts_id, 'Family Gift'),
        (gifts_id, 'Scholarship'),
        (gifts_id, 'Donation');

    -- Other Income subcategories
    INSERT INTO income_subcategories (income_type_id, name) VALUES
        (other_id, 'Lottery Winnings'),
        (other_id, 'Legal Settlements');
END $$;

-- Enable RLS
ALTER TABLE income_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_type_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for income_types
CREATE POLICY "Allow all users to view income types"
    ON income_types FOR SELECT
    TO authenticated
    USING (true);

-- Create policies for income_type_settings
CREATE POLICY "Users can view their own income type settings"
    ON income_type_settings FOR SELECT
    TO authenticated
    USING (
        source_id IN (
            SELECT id FROM sources WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own income type settings"
    ON income_type_settings FOR INSERT
    TO authenticated
    WITH CHECK (
        source_id IN (
            SELECT id FROM sources WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own income type settings"
    ON income_type_settings FOR UPDATE
    TO authenticated
    USING (
        source_id IN (
            SELECT id FROM sources WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        source_id IN (
            SELECT id FROM sources WHERE user_id = auth.uid()
        )
    );

-- Create policies for income_subcategories
CREATE POLICY "Allow all users to view income subcategories"
    ON income_subcategories FOR SELECT
    TO authenticated
    USING (true);
