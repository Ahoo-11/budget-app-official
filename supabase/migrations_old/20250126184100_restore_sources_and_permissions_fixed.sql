-- Restore sources
INSERT INTO sources (id, name, created_at, user_id) VALUES
    ('3f624f16-475e-4bd9-bc44-9191619997fb', 'Huvaa', '2024-12-26 18:54:30.502663+00', '5d972035-a0b8-4591-b49c-02dba9bd84aa'),
    ('c8625867-6296-49fb-8b05-539432c3ac28', 'Petrol', '2024-12-26 18:54:30.502663+00', '5d972035-a0b8-4591-b49c-02dba9bd84aa'),
    ('d5ac817d-430b-4640-ba4f-c494b4b62610', 'Huvaa', '2024-12-26 18:54:30.502663+00', '5d972035-a0b8-4591-b49c-02dba9bd84aa');

-- Restore source permissions for admins and viewers
INSERT INTO source_permissions (source_id, user_id, permission_level, created_at)
-- For admin users
SELECT s.id, ur.user_id, 'admin', NOW()
FROM sources s
CROSS JOIN user_roles ur
WHERE ur.role IN ('admin')
AND NOT EXISTS (
    SELECT 1 FROM source_permissions sp 
    WHERE sp.source_id = s.id 
    AND sp.user_id = ur.user_id
)
UNION ALL
-- For viewer users
SELECT s.id, ur.user_id, 'viewer', NOW()
FROM sources s
CROSS JOIN user_roles ur
WHERE ur.role IN ('viewer')
AND NOT EXISTS (
    SELECT 1 FROM source_permissions sp 
    WHERE sp.source_id = s.id 
    AND sp.user_id = ur.user_id
);

-- Verify the data
SELECT s.*, p.email as user_email
FROM sources s
JOIN profiles p ON s.user_id = p.id
ORDER BY s.name;
