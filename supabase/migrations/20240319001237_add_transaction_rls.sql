BEGIN;

-- Add RLS to new tables
ALTER TABLE public.budgetapp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgetapp_type_settings ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own transactions"
    ON public.budgetapp_transactions
    FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can view their own types"
    ON public.budgetapp_types
    FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can view their own type settings"
    ON public.budgetapp_type_settings
    FOR ALL
    USING (user_id = auth.uid());

COMMIT; 