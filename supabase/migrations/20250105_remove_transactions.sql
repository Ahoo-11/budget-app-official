-- Drop transaction-related tables and types
DROP TABLE IF EXISTS transactions;

-- Remove transaction-related columns from other tables if they exist
ALTER TABLE bills DROP COLUMN IF EXISTS transaction_id;

-- Update bill status type to remove transaction-related statuses
DROP TYPE IF EXISTS bill_status_type CASCADE;
CREATE TYPE bill_status_type AS ENUM ('active', 'completed');

-- Migrate existing bills to new status type
UPDATE bills 
SET status = CASE 
    WHEN status = 'pending' THEN 'active'
    WHEN status IN ('partially_paid', 'overdue') THEN 'active'
    ELSE status
END;
