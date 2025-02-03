-- Create enum type for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid');

-- Add payment_status column to bills table with default value
ALTER TABLE bills
ADD COLUMN payment_status payment_status NOT NULL DEFAULT 'pending';

-- Create trigger to set payment_status based on payment amount
CREATE OR REPLACE FUNCTION update_bill_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_amount = 0 THEN
        NEW.payment_status = 'pending';
    ELSIF NEW.payment_amount < NEW.total_amount THEN
        NEW.payment_status = 'partial';
    ELSE
        NEW.payment_status = 'paid';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bill_payment_status_trigger
    BEFORE INSERT OR UPDATE OF payment_amount ON bills
    FOR EACH ROW
    EXECUTE FUNCTION update_bill_payment_status();
