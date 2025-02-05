-- Insert initial source for each user
INSERT INTO budget_app.sources (name, user_id)
SELECT 'Default Source', id
FROM auth.users;

-- Insert initial categories
WITH source_data AS (
    SELECT s.id as source_id
    FROM budget_app.sources s
    JOIN auth.users u ON u.id = s.user_id
    LIMIT 1
)
INSERT INTO budget_app.categories (name, source_id)
SELECT name, source_data.source_id
FROM (
    VALUES 
        ('Income'),
        ('Expenses'),
        ('Investments')
) AS categories(name)
CROSS JOIN source_data;