-- Step 2: Rename simple tables that don't have many dependencies
ALTER TABLE IF EXISTS budget.profiles RENAME TO budgetapp_profiles;
ALTER TABLE IF EXISTS budget.user_roles RENAME TO budgetapp_user_roles;
ALTER TABLE IF EXISTS budget.sources RENAME TO budgetapp_sources;
