-- First drop any existing constraints
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key CASCADE;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_source_unique CASCADE;

-- Drop any existing indexes
DROP INDEX IF EXISTS idx_categories_source_id;

-- Add the new composite unique constraint
ALTER TABLE categories 
  ADD CONSTRAINT categories_name_source_unique 
  UNIQUE (name, source_id);

-- Add index for better performance
CREATE INDEX idx_categories_source_id 
  ON categories(source_id, name);
