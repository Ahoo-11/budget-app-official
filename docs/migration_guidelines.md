# Supabase Migration Guidelines

## Migration Naming Convention

Always use the following format:
```
YYYYMMDDHHMMSS_descriptive_name.sql
```

Examples:
✅ `20250125160000_add_recipe_system.sql`
✅ `20250125160100_update_product_schema.sql`
❌ `20250125.sql`  # Too vague
❌ `add_feature.sql`  # Missing timestamp

## Creating New Migrations

1. **Always Start Fresh**:
   ```bash
   git pull  # Get latest changes
   supabase db pull  # Sync with remote database
   ```

2. **Create New Migration**:
   ```bash
   supabase migration new my_feature_name
   ```

3. **Write Migration Content**:
   ```sql
   -- Up Migration
   CREATE TABLE my_table (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Down Migration (in case you need to rollback)
   DROP TABLE my_table;
   ```

## Testing Migrations

1. **Test Locally First**:
   ```bash
   supabase db reset  # Reset local database
   supabase start  # Start local services
   ```

2. **Verify Changes**:
   - Check if tables were created correctly
   - Test any new functions or triggers
   - Verify RLS policies work as expected

## Pushing to Production

1. **Commit Changes**:
   ```bash
   git add supabase/migrations/
   git commit -m "feat: add my feature migration"
   git push
   ```

2. **Push Migration**:
   ```bash
   supabase db push
   ```

## Common Pitfalls to Avoid

1. ❌ **Never modify existing migrations**
   - Create a new migration instead
   - Existing migrations might already be in production

2. ❌ **Don't run SQL directly in production**
   - Always create a migration file
   - Keep track of all schema changes

3. ❌ **Avoid multiple migrations for one feature**
   - Plan your changes
   - Combine related changes into one migration

4. ❌ **Don't ignore migration errors**
   - Fix issues immediately
   - Keep local and remote in sync

## Troubleshooting

If migrations get out of sync:

1. **Check Status**:
   ```bash
   supabase migration list
   ```

2. **Fix Remote Issues**:
   ```bash
   supabase db pull  # Get latest schema
   supabase migration repair  # If needed
   ```

3. **Reset if Necessary**:
   - Backup your database
   - Create a new baseline migration
   - Reset migration history

## Best Practices

1. **Descriptive Names**
   - Use clear, descriptive migration names
   - Include the purpose of the migration

2. **Atomic Changes**
   - One migration = one feature/change
   - Keep migrations focused and small

3. **Include Comments**
   - Document complex changes
   - Explain the purpose of the migration

4. **Version Control**
   - Always use git
   - Keep migrations in sync with code changes

5. **Test Everything**
   - Test migrations locally
   - Verify both up and down migrations work
   - Check RLS policies and functions

## Emergency Fixes

If you need to fix production urgently:

1. Create a new migration locally
2. Test it thoroughly
3. Push through normal channels
4. Never modify production directly

Remember: Database consistency is critical. When in doubt, create a new migration rather than modifying existing ones.
