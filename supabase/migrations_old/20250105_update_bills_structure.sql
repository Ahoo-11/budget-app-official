-- Update bills table structure
ALTER TABLE bills
  DROP COLUMN IF EXISTS transaction_id,
  DROP COLUMN IF EXISTS payment_status;

-- Add foreign key to payers table
ALTER TABLE bills
  ADD CONSTRAINT fk_bills_payers
  FOREIGN KEY (payer_id)
  REFERENCES payers(id)
  ON DELETE SET NULL;

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);

-- Create index on source_id and status combination
CREATE INDEX IF NOT EXISTS idx_bills_source_status ON bills(source_id, status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bills_timestamp ON bills;
CREATE TRIGGER update_bills_timestamp
  BEFORE UPDATE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION update_bills_updated_at();
