-- Create remaining tables in budget_app schema
CREATE TABLE budget_app.bills (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    date timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending',
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    document_url text,
    payer_id uuid
);

CREATE TABLE budget_app.income_types (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE budget_app.income_entries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount numeric(10,2) NOT NULL,
    date timestamp with time zone DEFAULT now(),
    description text,
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    income_type_id uuid REFERENCES budget_app.income_types(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    document_url text
);

CREATE TABLE budget_app.source_payer_settings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    payer_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(source_id, payer_id)
);

CREATE TABLE budget_app.source_permissions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    permission_level text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(source_id, user_id)
);

CREATE TABLE budget_app.source_templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id uuid REFERENCES budget_app.sources(id) ON DELETE CASCADE,
    name text NOT NULL,
    template_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE budget_app.audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    old_data jsonb,
    new_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE budget_app.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.income_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.income_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.source_payer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.source_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.source_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.audit_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their source bills"
    ON budget_app.bills FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = bills.source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert bills to their sources"
    ON budget_app.bills FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their source bills"
    ON budget_app.bills FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their source bills"
    ON budget_app.bills FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ));

-- Similar policies for income entries
CREATE POLICY "Users can view their source income"
    ON budget_app.income_entries FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = income_entries.source_id
        AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert income to their sources"
    ON budget_app.income_entries FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM budget_app.sources s
        WHERE s.id = source_id
        AND s.user_id = auth.uid()
    ));

-- Add indexes
CREATE INDEX idx_bills_source ON budget_app.bills(source_id);
CREATE INDEX idx_bills_date ON budget_app.bills(date);
CREATE INDEX idx_income_entries_source ON budget_app.income_entries(source_id);
CREATE INDEX idx_income_entries_date ON budget_app.income_entries(date);
CREATE INDEX idx_source_permissions_source ON budget_app.source_permissions(source_id);
CREATE INDEX idx_source_permissions_user ON budget_app.source_permissions(user_id);

-- Add triggers for updated_at
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON budget_app.bills
    FOR EACH ROW
    EXECUTE FUNCTION budget_app.trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON budget_app.income_entries
    FOR EACH ROW
    EXECUTE FUNCTION budget_app.trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON budget_app.income_types
    FOR EACH ROW
    EXECUTE FUNCTION budget_app.trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON budget_app.source_payer_settings
    FOR EACH ROW
    EXECUTE FUNCTION budget_app.trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON budget_app.source_permissions
    FOR EACH ROW
    EXECUTE FUNCTION budget_app.trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON budget_app.source_templates
    FOR EACH ROW
    EXECUTE FUNCTION budget_app.trigger_set_timestamp();
