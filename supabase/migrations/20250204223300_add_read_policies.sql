-- Add read policies for profiles
CREATE POLICY "Users can read their own profile"
    ON budget.profiles 
    FOR SELECT
    USING (auth.uid() = id);

-- Add read policies for user_roles
CREATE POLICY "Users can read their own role"
    ON budget.user_roles 
    FOR SELECT
    USING (auth.uid() = user_id);

-- Add read policies for sources
CREATE POLICY "Users can read sources they have permission for"
    ON budget.sources 
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM budget.source_permissions sp 
            WHERE sp.source_id = id 
            AND sp.user_id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM budget.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('controller', 'admin')
        )
    );

-- Add read policies for source_permissions
CREATE POLICY "Users can read their own source permissions"
    ON budget.source_permissions 
    FOR SELECT
    USING (auth.uid() = user_id);
