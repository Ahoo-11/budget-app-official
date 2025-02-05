-- Create bills table
CREATE TABLE IF NOT EXISTS budget.bills (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    title text,
    due_date timestamp with time zone,
    total decimal(10,2) DEFAULT 0,
    paid_amount decimal(10,2) DEFAULT 0,
    status text CHECK (status IN ('pending', 'partially_paid', 'paid', 'cancelled')) DEFAULT 'pending',
    source_id uuid REFERENCES budget.sources(id),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS budget.products (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    description text,
    current_stock integer DEFAULT 0,
    last_purchase_price decimal(10,2),
    last_purchase_date timestamp with time zone,
    source_id uuid REFERENCES budget.sources(id),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS budget.suppliers (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    email text,
    phone text,
    address text,
    source_id uuid REFERENCES budget.sources(id),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS budget.expenses (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    source_id uuid REFERENCES budget.sources(id),
    supplier_id uuid REFERENCES budget.suppliers(id),
    invoice_no text,
    date timestamp with time zone,
    total_amount decimal(10,2),
    created_by uuid REFERENCES auth.users(id),
    status text CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS budget.stock_movements (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    product_id uuid REFERENCES budget.products(id),
    expense_id uuid REFERENCES budget.expenses(id),
    movement_type text CHECK (movement_type IN ('purchase', 'sale', 'adjustment')),
    quantity integer,
    unit_cost decimal(10,2),
    created_by uuid REFERENCES auth.users(id),
    notes text,
    source_id uuid REFERENCES budget.sources(id),
    created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE budget.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget.stock_movements ENABLE ROW LEVEL SECURITY;

-- Bills policies
CREATE POLICY "Controllers can manage bills"
ON budget.bills FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid() AND role = 'controller'
    )
);

CREATE POLICY "Users can view assigned bills"
ON budget.bills FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        WHERE sp.source_id = source_id AND sp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage assigned bills"
ON budget.bills FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        JOIN budget.user_roles ur ON sp.user_id = ur.user_id
        WHERE sp.source_id = source_id 
        AND sp.user_id = auth.uid()
        AND ur.role = 'admin'
    )
);

-- Products policies
CREATE POLICY "Controllers can manage products"
ON budget.products FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid() AND role = 'controller'
    )
);

CREATE POLICY "Users can view assigned products"
ON budget.products FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        WHERE sp.source_id = source_id AND sp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage assigned products"
ON budget.products FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        JOIN budget.user_roles ur ON sp.user_id = ur.user_id
        WHERE sp.source_id = source_id 
        AND sp.user_id = auth.uid()
        AND ur.role = 'admin'
    )
);

-- Suppliers policies
CREATE POLICY "Controllers can manage suppliers"
ON budget.suppliers FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid() AND role = 'controller'
    )
);

CREATE POLICY "Users can view assigned suppliers"
ON budget.suppliers FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        WHERE sp.source_id = source_id AND sp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage assigned suppliers"
ON budget.suppliers FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        JOIN budget.user_roles ur ON sp.user_id = ur.user_id
        WHERE sp.source_id = source_id 
        AND sp.user_id = auth.uid()
        AND ur.role = 'admin'
    )
);

-- Expenses policies
CREATE POLICY "Controllers can manage expenses"
ON budget.expenses FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid() AND role = 'controller'
    )
);

CREATE POLICY "Users can view assigned expenses"
ON budget.expenses FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        WHERE sp.source_id = source_id AND sp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage assigned expenses"
ON budget.expenses FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        JOIN budget.user_roles ur ON sp.user_id = ur.user_id
        WHERE sp.source_id = source_id 
        AND sp.user_id = auth.uid()
        AND ur.role = 'admin'
    )
);

-- Stock movements policies
CREATE POLICY "Controllers can manage stock movements"
ON budget.stock_movements FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM budget.user_roles
        WHERE user_id = auth.uid() AND role = 'controller'
    )
);

CREATE POLICY "Users can view assigned stock movements"
ON budget.stock_movements FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        WHERE sp.source_id = source_id AND sp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage assigned stock movements"
ON budget.stock_movements FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM budget.source_permissions sp
        JOIN budget.user_roles ur ON sp.user_id = ur.user_id
        WHERE sp.source_id = source_id 
        AND sp.user_id = auth.uid()
        AND ur.role = 'admin'
    )
);
