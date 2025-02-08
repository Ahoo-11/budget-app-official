-- Create sessions table
CREATE TABLE IF NOT EXISTS public.budgetapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.budgetapp_sources(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'closing', 'closed')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.budgetapp_sessions ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" ON public.budgetapp_sessions
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert/update access to controllers and admins
CREATE POLICY "Allow insert access to controllers and admins" ON public.budgetapp_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.budgetapp_user_roles
            WHERE user_id = auth.uid()
            AND role IN ('controller', 'admin')
        )
    );

CREATE POLICY "Allow update access to controllers and admins" ON public.budgetapp_sessions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.budgetapp_user_roles
            WHERE user_id = auth.uid()
            AND role IN ('controller', 'admin')
        )
    );
