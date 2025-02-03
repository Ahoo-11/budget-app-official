-- Add income_type_id to bills table
ALTER TABLE bills
ADD COLUMN income_type_id UUID REFERENCES income_types(id);
