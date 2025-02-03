-- Add capability columns to sources table
ALTER TABLE sources
ADD COLUMN has_products boolean NOT NULL DEFAULT false,
ADD COLUMN has_services boolean NOT NULL DEFAULT false,
ADD COLUMN has_consignments boolean NOT NULL DEFAULT false;
