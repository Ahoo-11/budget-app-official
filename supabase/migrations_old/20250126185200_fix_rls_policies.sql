-- Enable RLS on all tables
ALTER TABLE budget_app.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_app.source_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for sources
CREATE POLICY controller_access_all ON budget_app.sources
FOR ALL USING (
    -- Controllers can access all sources
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'controller'
    )
    OR
    -- Others can only access their permitted sources
    id IN (
        SELECT source_id 
        FROM budget_app.source_permissions 
        WHERE user_id = auth.uid()
    )
);

-- Create policy for transactions
CREATE POLICY controller_access_all ON budget_app.transactions
FOR ALL USING (
    -- Controllers can access all transactions
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'controller'
    )
    OR
    -- Others can only access transactions from their permitted sources
    source_id IN (
        SELECT source_id 
        FROM budget_app.source_permissions 
        WHERE user_id = auth.uid()
    )
);

-- Create policy for categories
CREATE POLICY controller_access_all ON budget_app.categories
FOR ALL USING (
    -- Controllers can access all categories
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'controller'
    )
    OR
    -- Others can only access categories from their permitted sources
    source_id IN (
        SELECT source_id 
        FROM budget_app.source_permissions 
        WHERE user_id = auth.uid()
    )
);

-- Create policy for source_permissions
CREATE POLICY controller_access_all ON budget_app.source_permissions
FOR ALL USING (
    -- Controllers can manage all permissions
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'controller'
    )
    OR
    -- Users can see their own permissions
    user_id = auth.uid()
);
