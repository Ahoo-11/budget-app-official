-- Create function to make price optional
CREATE OR REPLACE FUNCTION make_price_optional()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  ALTER TABLE products ALTER COLUMN price DROP NOT NULL;
END;
$$;
