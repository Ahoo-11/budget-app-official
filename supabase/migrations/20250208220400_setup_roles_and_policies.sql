-- Helper function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.budgetapp_user_roles WHERE user_id = $1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user has access to source
CREATE OR REPLACE FUNCTION public.has_source_access(user_id UUID, source_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Controller has access to everything
  IF (SELECT get_user_role(user_id)) = 'controller' THEN
    RETURN TRUE;
  END IF;
  
  -- Check source permissions for admin and viewer
  RETURN EXISTS (
    SELECT 1 FROM public.budgetapp_source_permissions
    WHERE user_id = $1 AND source_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set controller account
INSERT INTO public.budgetapp_user_roles (user_id, role)
SELECT id, 'controller'
FROM auth.users
WHERE email = 'ahoo11official@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'controller';

-- RLS Policies for budgetapp_sources
DROP POLICY IF EXISTS "Sources access policy" ON public.budgetapp_sources;
CREATE POLICY "Sources access policy" ON public.budgetapp_sources
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  CASE 
    -- Controller can do anything
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    -- Others can only access sources they have permission for
    ELSE has_source_access(auth.uid(), id)
  END
)
WITH CHECK (
  -- Only controller can create/modify sources
  get_user_role(auth.uid()) = 'controller'
);

-- RLS Policies for budgetapp_source_permissions
DROP POLICY IF EXISTS "Source permissions access policy" ON public.budgetapp_source_permissions;
CREATE POLICY "Source permissions access policy" ON public.budgetapp_source_permissions
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    ELSE has_source_access(auth.uid(), source_id)
  END
)
WITH CHECK (
  -- Only controller can modify permissions
  get_user_role(auth.uid()) = 'controller'
);

-- RLS Policies for budgetapp_bills
DROP POLICY IF EXISTS "Bills access policy" ON public.budgetapp_bills;
CREATE POLICY "Bills access policy" ON public.budgetapp_bills
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    ELSE has_source_access(auth.uid(), source_id)
  END
)
WITH CHECK (
  CASE
    -- Controller can do anything
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    -- Admin can modify their sources
    WHEN get_user_role(auth.uid()) = 'admin' AND has_source_access(auth.uid(), source_id) THEN true
    -- Viewers can't modify
    ELSE false
  END
);

-- RLS Policies for budgetapp_expenses
DROP POLICY IF EXISTS "Expenses access policy" ON public.budgetapp_expenses;
CREATE POLICY "Expenses access policy" ON public.budgetapp_expenses
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    ELSE has_source_access(auth.uid(), source_id)
  END
)
WITH CHECK (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    WHEN get_user_role(auth.uid()) = 'admin' AND has_source_access(auth.uid(), source_id) THEN true
    ELSE false
  END
);

-- RLS Policies for budgetapp_products
DROP POLICY IF EXISTS "Products access policy" ON public.budgetapp_products;
CREATE POLICY "Products access policy" ON public.budgetapp_products
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    ELSE has_source_access(auth.uid(), source_id)
  END
)
WITH CHECK (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    WHEN get_user_role(auth.uid()) = 'admin' AND has_source_access(auth.uid(), source_id) THEN true
    ELSE false
  END
);

-- RLS Policies for budgetapp_stock_movements
DROP POLICY IF EXISTS "Stock movements access policy" ON public.budgetapp_stock_movements;
CREATE POLICY "Stock movements access policy" ON public.budgetapp_stock_movements
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    ELSE has_source_access(auth.uid(), source_id)
  END
)
WITH CHECK (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    WHEN get_user_role(auth.uid()) = 'admin' AND has_source_access(auth.uid(), source_id) THEN true
    ELSE false
  END
);

-- RLS Policies for budgetapp_suppliers
DROP POLICY IF EXISTS "Suppliers access policy" ON public.budgetapp_suppliers;
CREATE POLICY "Suppliers access policy" ON public.budgetapp_suppliers
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    ELSE has_source_access(auth.uid(), source_id)
  END
)
WITH CHECK (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    WHEN get_user_role(auth.uid()) = 'admin' AND has_source_access(auth.uid(), source_id) THEN true
    ELSE false
  END
);

-- RLS Policies for budgetapp_transactions
DROP POLICY IF EXISTS "Transactions access policy" ON public.budgetapp_transactions;
CREATE POLICY "Transactions access policy" ON public.budgetapp_transactions
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    ELSE has_source_access(auth.uid(), source_id)
  END
)
WITH CHECK (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    WHEN get_user_role(auth.uid()) = 'admin' AND has_source_access(auth.uid(), source_id) THEN true
    ELSE false
  END
);

-- RLS Policies for budgetapp_categories
DROP POLICY IF EXISTS "Categories access policy" ON public.budgetapp_categories;
CREATE POLICY "Categories access policy" ON public.budgetapp_categories
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    ELSE has_source_access(auth.uid(), source_id)
  END
)
WITH CHECK (
  CASE
    WHEN get_user_role(auth.uid()) = 'controller' THEN true
    WHEN get_user_role(auth.uid()) = 'admin' AND has_source_access(auth.uid(), source_id) THEN true
    ELSE false
  END
);

-- RLS Policies for budgetapp_user_roles
DROP POLICY IF EXISTS "User roles access policy" ON public.budgetapp_user_roles;
CREATE POLICY "User roles access policy" ON public.budgetapp_user_roles
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  -- Everyone can see roles
  true
)
WITH CHECK (
  -- Only controller can modify roles
  get_user_role(auth.uid()) = 'controller'
);

-- RLS Policies for budgetapp_profiles
DROP POLICY IF EXISTS "Profiles access policy" ON public.budgetapp_profiles;
CREATE POLICY "Profiles access policy" ON public.budgetapp_profiles
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  -- Everyone can see profiles
  true
)
WITH CHECK (
  -- Users can only modify their own profile
  auth.uid() = id
);
