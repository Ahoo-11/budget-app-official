-- Enable RLS on bills table
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS bills_select_policy ON bills;
DROP POLICY IF EXISTS bills_insert_policy ON bills;
DROP POLICY IF EXISTS bills_update_policy ON bills;
DROP POLICY IF EXISTS bills_delete_policy ON bills;

-- Create policies for bills table
CREATE POLICY bills_select_policy ON bills
  FOR SELECT USING (
    has_source_access(source_id)
  );

CREATE POLICY bills_insert_policy ON bills
  FOR INSERT WITH CHECK (
    has_source_access(source_id)
  );

CREATE POLICY bills_update_policy ON bills
  FOR UPDATE USING (
    has_source_access(source_id)
  );

CREATE POLICY bills_delete_policy ON bills
  FOR DELETE USING (
    has_source_access(source_id)
  );
