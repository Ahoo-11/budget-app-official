-- Step 5: Rename remaining tables
ALTER TABLE IF EXISTS budget.stock_movements RENAME TO budgetapp_stock_movements;
ALTER TABLE IF EXISTS budget.suppliers RENAME TO budgetapp_suppliers;
ALTER TABLE IF EXISTS budget.transactions RENAME TO budgetapp_transactions;
