-- Drop public schema tables after moving data
DROP TABLE IF EXISTS public.recipe_ingredients CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.measurement_units CASCADE;
DROP TABLE IF EXISTS public.sources CASCADE;

-- Create views in public schema that point to budget_app schema
-- This allows the application to work without code changes
CREATE VIEW public.measurement_units AS SELECT * FROM budget_app.measurement_units;
CREATE VIEW public.sources AS SELECT * FROM budget_app.sources;
CREATE VIEW public.products AS SELECT * FROM budget_app.products;
CREATE VIEW public.recipe_ingredients AS SELECT * FROM budget_app.recipe_ingredients;

-- Grant permissions on views
GRANT SELECT, INSERT, UPDATE, DELETE ON public.measurement_units TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sources TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_ingredients TO authenticated;

GRANT SELECT ON public.measurement_units TO anon;
GRANT SELECT ON public.sources TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.recipe_ingredients TO anon;
