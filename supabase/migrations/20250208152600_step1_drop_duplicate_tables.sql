-- Step 1: Drop duplicate tables with CASCADE to handle any dependencies
DROP TABLE IF EXISTS budget.budgetapp_bills CASCADE;
DROP TABLE IF EXISTS budget.budgetapp_categories CASCADE;
DROP TABLE IF EXISTS budget.budgetapp_payers CASCADE;
DROP TABLE IF EXISTS budget.budgetapp_profiles CASCADE;
DROP TABLE IF EXISTS budget.budgetapp_source_permissions CASCADE;
DROP TABLE IF EXISTS budget.budgetapp_sources CASCADE;
DROP TABLE IF EXISTS budget.budgetapp_transactions CASCADE;
DROP TABLE IF EXISTS budget.budgetapp_user_roles CASCADE;
