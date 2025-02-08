-- Step 3: Rename tables that depend on the previously renamed tables
ALTER TABLE IF EXISTS budget.source_permissions RENAME TO budgetapp_source_permissions;
ALTER TABLE IF EXISTS budget.categories RENAME TO budgetapp_categories;
ALTER TABLE IF EXISTS budget.products RENAME TO budgetapp_products;
ALTER TABLE IF EXISTS budget.bills RENAME TO budgetapp_bills;
ALTER TABLE IF EXISTS budget.expenses RENAME TO budgetapp_expenses;
ALTER TABLE IF EXISTS budget.budgets RENAME TO budgetapp_budgets;
