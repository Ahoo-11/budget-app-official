-- Update any bills with null or invalid status to 'active'
UPDATE bills
SET status = 'active'
WHERE status IS NULL OR status NOT IN ('active', 'completed');

-- Update bills that are fully paid to 'completed'
UPDATE bills
SET status = 'completed'
WHERE paid_amount >= total AND status != 'completed';

-- Add a check constraint to ensure only valid status values
ALTER TABLE bills
  ADD CONSTRAINT chk_bills_status
  CHECK (status IN ('active', 'completed'));
