BEGIN;

-- First check if source_id exists in suppliers table, if not, add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'budgetapp_suppliers' 
        AND column_name = 'source_id'
    ) THEN
        ALTER TABLE public.budgetapp_suppliers ADD COLUMN source_id UUID REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create source types table
CREATE TABLE IF NOT EXISTS public.budgetapp_source_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create measurement units table
CREATE TABLE IF NOT EXISTS public.budgetapp_measurement_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.budgetapp_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category TEXT,
    measurement_unit_id UUID REFERENCES public.budgetapp_measurement_units(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create consignments table
CREATE TABLE IF NOT EXISTS public.budgetapp_consignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    purchase_price DECIMAL(10,2),
    category TEXT,
    measurement_unit_id UUID REFERENCES public.budgetapp_measurement_units(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create suppliers table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'budgetapp_suppliers'
    ) THEN
        CREATE TABLE public.budgetapp_suppliers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            source_id UUID REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

COMMIT;

-- Start a new transaction for RLS and policies
BEGIN;

-- Enable RLS
ALTER TABLE public.budgetapp_source_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_measurement_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Source types are viewable by authenticated users" ON public.budgetapp_source_types;
DROP POLICY IF EXISTS "Measurement units are viewable by authenticated users" ON public.budgetapp_measurement_units;
DROP POLICY IF EXISTS "Services access policy" ON public.budgetapp_services;
DROP POLICY IF EXISTS "Consignments access policy" ON public.budgetapp_consignments;
DROP POLICY IF EXISTS "Suppliers access policy" ON public.budgetapp_suppliers;

-- Add RLS policies
CREATE POLICY "Source types are viewable by authenticated users" ON public.budgetapp_source_types
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Measurement units are viewable by authenticated users" ON public.budgetapp_measurement_units
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Services access policy" ON public.budgetapp_services AS PERMISSIVE
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.budgetapp_sources s
            WHERE s.id = budgetapp_services.source_id
            AND (
                s.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.budgetapp_source_permissions sp
                    WHERE sp.source_id = s.id
                    AND sp.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Consignments access policy" ON public.budgetapp_consignments AS PERMISSIVE
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.budgetapp_sources s
            WHERE s.id = budgetapp_consignments.source_id
            AND (
                s.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.budgetapp_source_permissions sp
                    WHERE sp.source_id = s.id
                    AND sp.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Suppliers access policy" ON public.budgetapp_suppliers AS PERMISSIVE
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.budgetapp_sources s
            WHERE s.id = budgetapp_suppliers.source_id
            AND (
                s.created_by = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.budgetapp_source_permissions sp
                    WHERE sp.source_id = s.id
                    AND sp.user_id = auth.uid()
                )
            )
        )
    );

COMMIT; 