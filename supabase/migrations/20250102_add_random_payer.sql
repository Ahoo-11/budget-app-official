-- Create the payers table if it doesn't exist
CREATE TABLE IF NOT EXISTS payers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  source_id UUID REFERENCES sources(id),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE payers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view payers in their sources"
  ON payers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'controller'
    )
    OR 
    EXISTS (
      SELECT 1 FROM source_permissions
      WHERE source_permissions.user_id = auth.uid()
      AND source_permissions.source_id = payers.source_id
    )
  );