-- Update source names to be more specific
UPDATE sources 
SET name = 'Huvaa Restaurant'
WHERE id = '3f624f16-475e-4bd9-bc44-9191619997fb';

UPDATE sources 
SET name = 'Huvaa Cafe'
WHERE id = 'd5ac817d-430b-4640-ba4f-c494b4b62610';

-- Verify the changes
SELECT s.*, p.email as user_email,
    string_agg(DISTINCT c.name, ', ') as categories
FROM sources s
JOIN profiles p ON s.user_id = p.id
LEFT JOIN categories c ON c.source_id = s.id
GROUP BY s.id, s.name, s.created_at, s.user_id, p.email
ORDER BY s.name;
