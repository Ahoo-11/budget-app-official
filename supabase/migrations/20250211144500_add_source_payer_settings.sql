BEGIN;

-- Create source payer settings table
CREATE TABLE IF NOT EXISTS public.budgetapp_source_payer_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES public.budgetapp_payers(id) ON DELETE CASCADE,
    credit_days INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, payer_id)
);

-- Enable RLS
ALTER TABLE public.budgetapp_source_payer_settings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Source payer settings access policy" ON public.budgetapp_source_payer_settings
AS PERMISSIVE FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.budgetapp_sources s
        WHERE s.id = source_id
        AND (
            -- User has direct access to source
            s.user_id = auth.uid()
            OR
            -- User has permission through source_permissions
            EXISTS (
                SELECT 1 FROM public.budgetapp_source_permissions sp
                WHERE sp.source_id = s.id
                AND sp.user_id = auth.uid()
            )
        )
    )
);

COMMIT; 