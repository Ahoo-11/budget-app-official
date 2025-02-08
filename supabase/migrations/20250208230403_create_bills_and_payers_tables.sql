-- Create payers table
CREATE TABLE IF NOT EXISTS public.budgetapp_payers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    source_id UUID REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS public.budgetapp_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES public.budgetapp_payers(id) ON DELETE SET NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT CHECK (payment_method IN ('cash', 'transfer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies for payers
ALTER TABLE public.budgetapp_payers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users" ON public.budgetapp_payers
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow insert/update access to controllers and admins" ON public.budgetapp_payers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.budgetapp_user_roles
            WHERE user_id = auth.uid()
            AND role IN ('controller', 'admin')
        )
    );

CREATE POLICY "Allow update access to controllers and admins" ON public.budgetapp_payers
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.budgetapp_user_roles
            WHERE user_id = auth.uid()
            AND role IN ('controller', 'admin')
        )
    );

-- Add RLS policies for bills
ALTER TABLE public.budgetapp_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users" ON public.budgetapp_bills
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow insert access to controllers and admins" ON public.budgetapp_bills
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.budgetapp_user_roles
            WHERE user_id = auth.uid()
            AND role IN ('controller', 'admin')
        )
    );

CREATE POLICY "Allow update access to controllers and admins" ON public.budgetapp_bills
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.budgetapp_user_roles
            WHERE user_id = auth.uid()
            AND role IN ('controller', 'admin')
        )
    );
