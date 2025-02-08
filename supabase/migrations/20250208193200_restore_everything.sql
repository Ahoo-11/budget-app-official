-- First recreate the budget schema
CREATE SCHEMA IF NOT EXISTS budget;

-- Create enum types in budget schema
CREATE TYPE budget.user_role AS ENUM ('controller', 'admin', 'viewer');
CREATE TYPE budget.user_status AS ENUM ('pending', 'approved', 'rejected');

-- Recreate all tables in budget schema
CREATE TABLE IF NOT EXISTS budget.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    status budget.user_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    role budget.user_role DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS budget.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.source_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    source_id UUID REFERENCES budget.sources(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, source_id)
);

CREATE TABLE IF NOT EXISTS budget.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    source_id UUID REFERENCES budget.sources(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    current_stock INTEGER DEFAULT 0,
    last_purchase_price DECIMAL,
    last_purchase_date TIMESTAMPTZ,
    source_id UUID REFERENCES budget.sources(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    due_date TIMESTAMPTZ,
    total DECIMAL DEFAULT 0,
    paid_amount DECIMAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    source_id UUID REFERENCES budget.sources(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT,
    source_id UUID REFERENCES budget.sources(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES budget.sources(id),
    supplier_id UUID REFERENCES budget.suppliers(id),
    invoice_no TEXT,
    date TIMESTAMPTZ,
    total_amount DECIMAL,
    created_by UUID REFERENCES auth.users(id),
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES budget.products(id),
    quantity DECIMAL NOT NULL,
    movement_type TEXT NOT NULL,
    movement_date DATE DEFAULT CURRENT_DATE,
    source_id UUID REFERENCES budget.sources(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT,
    amount DECIMAL,
    type TEXT,
    category TEXT,
    date TIMESTAMPTZ DEFAULT now(),
    source_id UUID REFERENCES budget.sources(id),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE budget.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.source_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.transactions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Enable read for authenticated users" ON budget.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON budget.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON budget.sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON budget.source_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON budget.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON budget.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON budget.bills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON budget.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON budget.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON budget.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON budget.budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON budget.transactions FOR SELECT TO authenticated USING (true);
