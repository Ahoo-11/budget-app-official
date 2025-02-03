-- First, delete any existing income types to start fresh
DELETE FROM income_types;

-- Insert the income types that match the settings UI
INSERT INTO income_types (name, description)
VALUES
  ('Employment Income', 'Income from employment including salary, bonuses, and commissions'),
  ('Gifts and Grants', 'Income from gifts, grants, and donations'),
  ('Investment Income', 'Income from investments'),
  ('Other Income', 'Miscellaneous income sources');

-- Insert subcategories for Employment Income
INSERT INTO income_subcategories (income_type_id, name)
SELECT id, unnest(ARRAY['Allowances', 'Bonuses', 'Commissions', 'Overtime Pay', 'Salary', 'Tips'])
FROM income_types WHERE name = 'Employment Income';

-- Insert subcategories for Investment Income
INSERT INTO income_subcategories (income_type_id, name)
SELECT id, unnest(ARRAY['Capital Gains', 'Dividends', 'Interest'])
FROM income_types WHERE name = 'Investment Income';

-- Add RLS policies
ALTER TABLE income_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON income_types;
CREATE POLICY "Enable read access for authenticated users"
ON income_types FOR SELECT
TO authenticated
USING (true);

-- Add policies for income_type_settings
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON income_type_settings;
CREATE POLICY "Enable insert for authenticated users"
ON income_type_settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sources
    WHERE id = income_type_settings.source_id
    AND (
      sources.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM source_permissions
        WHERE source_id = sources.id
        AND user_id = auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON income_type_settings;
CREATE POLICY "Enable update for authenticated users"
ON income_type_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sources
    WHERE id = income_type_settings.source_id
    AND (
      sources.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM source_permissions
        WHERE source_id = sources.id
        AND user_id = auth.uid()
      )
    )
  )
);
