-- Remove duplicate royalties type
DO $$
DECLARE
    royalties_id UUID;
    duplicate_royalties_id UUID;
BEGIN
    -- Get the first royalties type ID
    SELECT id INTO royalties_id 
    FROM income_types 
    WHERE name = 'Royalties' 
    ORDER BY created_at ASC 
    LIMIT 1;

    -- Get any duplicate royalties type IDs
    SELECT id INTO duplicate_royalties_id 
    FROM income_types 
    WHERE name = 'Royalties' 
    AND id != royalties_id;

    -- Update any references to the duplicate ID to use the original ID
    IF duplicate_royalties_id IS NOT NULL THEN
        -- Update income_type_settings
        UPDATE income_type_settings 
        SET income_type_id = royalties_id 
        WHERE income_type_id = duplicate_royalties_id;

        -- Update income_subcategories
        UPDATE income_subcategories 
        SET income_type_id = royalties_id 
        WHERE income_type_id = duplicate_royalties_id;

        -- Update products
        UPDATE products 
        SET income_type_id = royalties_id 
        WHERE income_type_id = duplicate_royalties_id;

        -- Delete the duplicate type
        DELETE FROM income_types 
        WHERE id = duplicate_royalties_id;
    END IF;
END $$;
