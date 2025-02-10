-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.budgetapp_suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create payers table
CREATE TABLE IF NOT EXISTS public.budgetapp_payers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create templates table
CREATE TABLE IF NOT EXISTS public.budgetapp_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE public.budgetapp_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_templates ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view their own suppliers"
    ON public.budgetapp_suppliers
    FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Users can view their own payers"
    ON public.budgetapp_payers
    FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Users can view their own templates"
    ON public.budgetapp_templates
    FOR SELECT
    USING (created_by = auth.uid()); 