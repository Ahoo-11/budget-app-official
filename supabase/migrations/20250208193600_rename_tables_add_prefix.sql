-- Rename tables one by one to add budgetapp_ prefix
ALTER TABLE IF EXISTS budget.bills RENAME TO budgetapp_bills;
ALTER TABLE IF EXISTS budget.budgets RENAME TO budgetapp_budgets;
ALTER TABLE IF EXISTS budget.categories RENAME TO budgetapp_categories;
ALTER TABLE IF EXISTS budget.expenses RENAME TO budgetapp_expenses;
ALTER TABLE IF EXISTS budget.products RENAME TO budgetapp_products;
ALTER TABLE IF EXISTS budget.profiles RENAME TO budgetapp_profiles;
ALTER TABLE IF EXISTS budget.source_permissions RENAME TO budgetapp_source_permissions;
ALTER TABLE IF EXISTS budget.sources RENAME TO budgetapp_sources;
ALTER TABLE IF EXISTS budget.stock_movements RENAME TO budgetapp_stock_movements;
ALTER TABLE IF EXISTS budget.suppliers RENAME TO budgetapp_suppliers;
ALTER TABLE IF EXISTS budget.transactions RENAME TO budgetapp_transactions;
ALTER TABLE IF EXISTS budget.user_roles RENAME TO budgetapp_user_roles;
