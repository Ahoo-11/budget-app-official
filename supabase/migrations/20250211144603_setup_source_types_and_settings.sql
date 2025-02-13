BEGIN;

-- First handle source_payer_settings
DO $$ 
BEGIN
    -- Create the table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.budgetapp_source_payer_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_id UUID REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE,
        payer_id UUID REFERENCES public.budgetapp_payers(id) ON DELETE CASCADE,
        credit_days INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(source_id, payer_id)
    );

    -- Enable RLS if table exists
    ALTER TABLE IF EXISTS public.budgetapp_source_payer_settings ENABLE ROW LEVEL SECURITY;

    -- Drop policy if exists and create new one
    DROP POLICY IF EXISTS "Source payer settings access policy" ON public.budgetapp_source_payer_settings;
    
    CREATE POLICY "Source payer settings access policy" ON public.budgetapp_source_payer_settings AS PERMISSIVE
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.budgetapp_sources s
                WHERE s.id = budgetapp_source_payer_settings.source_id
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
END $$;

-- Then handle source types
DO $$ 
BEGIN
    -- Add UNIQUE constraint to name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'source_types_name_key'
    ) THEN
        ALTER TABLE public.budgetapp_source_types ADD CONSTRAINT source_types_name_key UNIQUE (name);
    END IF;

    -- Insert source types
    INSERT INTO public.budgetapp_source_types (name, description)
    VALUES 
        ('Products', 'Regular products for sale'),
        ('Services', 'Services offered'),
        ('Inventory', 'Inventory management'),
        ('Consignments', 'Consignment items'),
        ('Suppliers', 'Supplier management'),
        ('Rentals', 'Rental items and services'),
        ('Digital', 'Digital products and services'),
        ('Raw Materials', 'Raw materials for production'),
        ('Equipment', 'Equipment and machinery'),
        ('Miscellaneous', 'Other source types')
    ON CONFLICT (name) DO NOTHING;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;

COMMIT; 