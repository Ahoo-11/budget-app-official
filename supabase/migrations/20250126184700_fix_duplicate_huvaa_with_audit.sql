-- Move any transactions from duplicate to original Huvaa
UPDATE transactions 
SET source_id = 'd5ac817d-430b-4640-ba4f-c494b4b62610'  -- original Huvaa
WHERE source_id = '3f624f16-475e-4bd9-bc44-9191619997fb';  -- duplicate Huvaa

-- Move any categories from duplicate to original Huvaa
UPDATE categories
SET source_id = 'd5ac817d-430b-4640-ba4f-c494b4b62610'  -- original Huvaa
WHERE source_id = '3f624f16-475e-4bd9-bc44-9191619997fb';  -- duplicate Huvaa

-- Delete source permissions for the duplicate
DELETE FROM source_permissions
WHERE source_id = '3f624f16-475e-4bd9-bc44-9191619997fb';

-- Insert audit log for the cleanup
INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data, created_at)
VALUES (
    '5d972035-a0b8-4591-b49c-02dba9bd84aa',  -- your user_id as the controller
    'DELETE',
    'sources',
    '3f624f16-475e-4bd9-bc44-9191619997fb',
    jsonb_build_object(
        'id', '3f624f16-475e-4bd9-bc44-9191619997fb',
        'name', 'Huvaa',
        'reason', 'Duplicate source cleanup'
    ),
    NULL,
    NOW()
);

-- Delete the duplicate Huvaa source
DELETE FROM sources 
WHERE id = '3f624f16-475e-4bd9-bc44-9191619997fb';

-- Verify we only have one Huvaa now
SELECT s.*, 
    COUNT(DISTINCT t.id) as transaction_count,
    string_agg(DISTINCT c.name, ', ') as categories
FROM sources s
LEFT JOIN transactions t ON t.source_id = s.id
LEFT JOIN categories c ON c.source_id = s.id
GROUP BY s.id, s.name, s.created_at, s.user_id
ORDER BY s.name;
