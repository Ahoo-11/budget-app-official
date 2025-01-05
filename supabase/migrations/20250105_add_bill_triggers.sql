-- Create function to ensure bill status is either 'active' or 'completed'
CREATE OR REPLACE FUNCTION validate_bill_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default status to 'active' if not provided
  IF NEW.status IS NULL THEN
    NEW.status = 'active';
  END IF;

  -- Ensure status is valid
  IF NEW.status NOT IN ('active', 'completed') THEN
    RAISE EXCEPTION 'Invalid bill status: %. Must be either active or completed.', NEW.status;
  END IF;

  -- Auto-complete bills that are fully paid
  IF NEW.paid_amount >= NEW.total AND NEW.status != 'completed' THEN
    NEW.status = 'completed';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate bill status before insert or update
DROP TRIGGER IF EXISTS validate_bill_status_trigger ON bills;
CREATE TRIGGER validate_bill_status_trigger
  BEFORE INSERT OR UPDATE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION validate_bill_status();

-- Create index on bills status for faster filtering
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);

-- Add check constraint to bills table
ALTER TABLE bills
  DROP CONSTRAINT IF EXISTS chk_bills_status;
ALTER TABLE bills
  ADD CONSTRAINT chk_bills_status
  CHECK (status IN ('active', 'completed'));
