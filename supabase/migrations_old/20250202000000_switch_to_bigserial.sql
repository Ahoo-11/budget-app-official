-- Drop existing tables in reverse order of creation
DROP TABLE IF EXISTS budget.transactions;
DROP TABLE IF EXISTS budget.categories;
DROP TABLE IF EXISTS budget.budgets;
DROP TABLE IF EXISTS budget.users;

-- Recreate tables with BIGSERIAL
CREATE TABLE IF NOT EXISTS budget.users (
    id BIGSERIAL PRIMARY KEY,
    auth_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES budget.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.categories (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT REFERENCES budget.budgets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.transactions (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES budget.categories(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE budget.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.transactions ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON budget.users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile" ON budget.users
    FOR UPDATE USING (auth.uid() = auth_id);

-- Budget policies
CREATE POLICY "Users can view own budgets" ON budget.budgets
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = budget.budgets.user_id
        )
    );

CREATE POLICY "Users can create budgets" ON budget.budgets
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = budget.budgets.user_id
        )
    );

CREATE POLICY "Users can update own budgets" ON budget.budgets
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = budget.budgets.user_id
        )
    );

CREATE POLICY "Users can delete own budgets" ON budget.budgets
    FOR DELETE USING (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = budget.budgets.user_id
        )
    );

-- Category policies
CREATE POLICY "Users can view own categories" ON budget.categories
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = (
                SELECT user_id FROM budget.budgets WHERE id = budget.categories.budget_id
            )
        )
    );

CREATE POLICY "Users can create categories in own budgets" ON budget.categories
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = (
                SELECT user_id FROM budget.budgets WHERE id = budget.categories.budget_id
            )
        )
    );

CREATE POLICY "Users can update own categories" ON budget.categories
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = (
                SELECT user_id FROM budget.budgets WHERE id = budget.categories.budget_id
            )
        )
    );

CREATE POLICY "Users can delete own categories" ON budget.categories
    FOR DELETE USING (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = (
                SELECT user_id FROM budget.budgets WHERE id = budget.categories.budget_id
            )
        )
    );

-- Transaction policies
CREATE POLICY "Users can view own transactions" ON budget.transactions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = (
                SELECT user_id FROM budget.budgets WHERE id = (
                    SELECT budget_id FROM budget.categories WHERE id = budget.transactions.category_id
                )
            )
        )
    );

CREATE POLICY "Users can create transactions in own categories" ON budget.transactions
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = (
                SELECT user_id FROM budget.budgets WHERE id = (
                    SELECT budget_id FROM budget.categories WHERE id = budget.transactions.category_id
                )
            )
        )
    );

CREATE POLICY "Users can update own transactions" ON budget.transactions
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = (
                SELECT user_id FROM budget.budgets WHERE id = (
                    SELECT budget_id FROM budget.categories WHERE id = budget.transactions.category_id
                )
            )
        )
    );

CREATE POLICY "Users can delete own transactions" ON budget.transactions
    FOR DELETE USING (
        auth.uid() IN (
            SELECT auth_id FROM budget.users WHERE id = (
                SELECT user_id FROM budget.budgets WHERE id = (
                    SELECT budget_id FROM budget.categories WHERE id = budget.transactions.category_id
                )
            )
        )
    );
