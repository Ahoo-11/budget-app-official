BEGIN;

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.budgetapp_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_id UUID REFERENCES budgetapp_sources(id),
    description TEXT,
    amount DECIMAL,
    date TIMESTAMP WITH TIME ZONE,
    type TEXT,
    category TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create types table
CREATE TABLE IF NOT EXISTS public.budgetapp_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create type_settings table
CREATE TABLE IF NOT EXISTS public.budgetapp_type_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type_id UUID REFERENCES budgetapp_types(id),
    is_enabled BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add display_name columns
ALTER TABLE public.budgetapp_payers ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.budgetapp_suppliers ADD COLUMN IF NOT EXISTS display_name TEXT;

COMMIT; 