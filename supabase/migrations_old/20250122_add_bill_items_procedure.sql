-- Create bill items stored procedure
CREATE OR REPLACE FUNCTION create_bill_items(
  p_bill_id UUID,
  p_items JSONB[]
) RETURNS VOID AS $$
BEGIN
  INSERT INTO bill_items (
    bill_id,
    item_id,
    item_type,
    quantity,
    price,
    total
  )
  SELECT
    p_bill_id,
    (item->>'item_id')::UUID,
    (item->>'item_type')::TEXT,
    (item->>'quantity')::NUMERIC,
    (item->>'price')::NUMERIC,
    (item->>'total')::NUMERIC
  FROM jsonb_array_elements(p_items::JSONB) AS item;

  -- Update the bill total
  UPDATE bills b
  SET 
    subtotal = (
      SELECT SUM(total)
      FROM bill_items
      WHERE bill_id = p_bill_id
    ),
    gst = (
      SELECT SUM(total) * 0.1
      FROM bill_items
      WHERE bill_id = p_bill_id
    ),
    total = (
      SELECT SUM(total) * 1.1
      FROM bill_items
      WHERE bill_id = p_bill_id
    )
  WHERE b.id = p_bill_id;
END;
$$ LANGUAGE plpgsql;

-- Drop function on rollback
DROP FUNCTION IF EXISTS create_bill_items(UUID, JSONB[]);
