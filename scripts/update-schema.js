const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://btzllgnzmjdxzdioulfu.supabase.co';
const supabaseKey = 'sbp_9058083e37b5ddbe047c13f29247f7ce4b87c271';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSchema() {
  try {
    // Add content unit fields to products table
    await supabase.rpc('exec', {
      query: `
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS content_unit_id uuid REFERENCES measurement_units(id),
        ADD COLUMN IF NOT EXISTS content_per_unit numeric(10, 3);
      `
    });

    // Add constraint to ensure content fields are set for basic products
    await supabase.rpc('exec', {
      query: `
        ALTER TABLE products
        ADD CONSTRAINT IF NOT EXISTS check_basic_product_content 
        CHECK (
          (product_type = 'basic' AND content_unit_id IS NOT NULL AND content_per_unit IS NOT NULL)
          OR
          product_type = 'composite'
        );
      `
    });

    // Add constraint to ensure content_per_unit is positive
    await supabase.rpc('exec', {
      query: `
        ALTER TABLE products
        ADD CONSTRAINT IF NOT EXISTS check_positive_content_per_unit
        CHECK (content_per_unit > 0);
      `
    });

    // Update recipe_ingredients to store content quantity
    await supabase.rpc('exec', {
      query: `
        ALTER TABLE recipe_ingredients
        DROP COLUMN IF EXISTS conversion_ratio,
        DROP COLUMN IF EXISTS purchase_unit_id,
        DROP COLUMN IF EXISTS sales_unit_id,
        ADD COLUMN IF NOT EXISTS content_quantity numeric(10, 3) NOT NULL DEFAULT 1;
      `
    });

    // Add constraint to ensure content_quantity is positive
    await supabase.rpc('exec', {
      query: `
        ALTER TABLE recipe_ingredients
        ADD CONSTRAINT IF NOT EXISTS check_positive_content_quantity
        CHECK (content_quantity > 0);
      `
    });

    // Create function to calculate required units
    await supabase.rpc('exec', {
      query: `
        CREATE OR REPLACE FUNCTION calculate_required_units(
          required_content numeric,
          content_per_unit numeric
        ) RETURNS numeric
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN CEIL(required_content / content_per_unit);
        END;
        $$;
      `
    });

    // Create function to calculate available content
    await supabase.rpc('exec', {
      query: `
        CREATE OR REPLACE FUNCTION calculate_available_content(
          product_id uuid
        ) RETURNS numeric
        LANGUAGE plpgsql
        AS $$
        DECLARE
          product_record record;
        BEGIN
          SELECT 
            current_stock,
            content_per_unit
          INTO product_record
          FROM products
          WHERE id = product_id;

          RETURN COALESCE(product_record.current_stock * product_record.content_per_unit, 0);
        END;
        $$;
      `
    });

    console.log('Schema updated successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  }
}

updateSchema();
