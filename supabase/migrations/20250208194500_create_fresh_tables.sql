-- Create fresh tables in public schema
CREATE TABLE public.budgetapp_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budgetapp_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budgetapp_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    role TEXT DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE public.budgetapp_source_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    source_id UUID REFERENCES public.budgetapp_sources(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, source_id)
);

CREATE TABLE public.budgetapp_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    source_id UUID REFERENCES public.budgetapp_sources(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budgetapp_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT,
    source_id UUID REFERENCES public.budgetapp_sources(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budgetapp_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    current_stock INTEGER DEFAULT 0,
    last_purchase_price DECIMAL,
    last_purchase_date TIMESTAMPTZ,
    source_id UUID REFERENCES public.budgetapp_sources(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budgetapp_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    due_date TIMESTAMPTZ,
    total DECIMAL DEFAULT 0,
    paid_amount DECIMAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    source_id UUID REFERENCES public.budgetapp_sources(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budgetapp_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.budgetapp_sources(id),
    supplier_id UUID REFERENCES public.budgetapp_suppliers(id),
    invoice_no TEXT,
    date TIMESTAMPTZ,
    total_amount DECIMAL,
    created_by UUID REFERENCES auth.users(id),
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budgetapp_stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.budgetapp_products(id),
    quantity DECIMAL NOT NULL,
    movement_type TEXT NOT NULL,
    movement_date DATE DEFAULT CURRENT_DATE,
    source_id UUID REFERENCES public.budgetapp_sources(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budgetapp_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budgetapp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT,
    amount DECIMAL,
    type TEXT,
    category TEXT,
    date TIMESTAMPTZ DEFAULT now(),
    source_id UUID REFERENCES public.budgetapp_sources(id),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budgetapp_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_source_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_user_roles ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_bills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_source_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON public.budgetapp_user_roles FOR SELECT TO authenticated USING (true);
