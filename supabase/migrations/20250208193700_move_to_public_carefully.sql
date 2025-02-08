-- First move the enum types (they need to move before tables that use them)
ALTER TYPE budget.user_role SET SCHEMA public;
ALTER TYPE budget.user_status SET SCHEMA public;

-- Move each table one by one, NO CASCADE, NO DROPPING
ALTER TABLE budget.budgetapp_bills SET SCHEMA public;
ALTER TABLE budget.budgetapp_budgets SET SCHEMA public;
ALTER TABLE budget.budgetapp_categories SET SCHEMA public;
ALTER TABLE budget.budgetapp_expenses SET SCHEMA public;
ALTER TABLE budget.budgetapp_products SET SCHEMA public;
ALTER TABLE budget.budgetapp_profiles SET SCHEMA public;
ALTER TABLE budget.budgetapp_source_permissions SET SCHEMA public;
ALTER TABLE budget.budgetapp_sources SET SCHEMA public;
ALTER TABLE budget.budgetapp_stock_movements SET SCHEMA public;
ALTER TABLE budget.budgetapp_suppliers SET SCHEMA public;
ALTER TABLE budget.budgetapp_transactions SET SCHEMA public;
ALTER TABLE budget.budgetapp_user_roles SET SCHEMA public;
