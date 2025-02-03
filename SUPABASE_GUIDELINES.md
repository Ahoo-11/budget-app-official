# Supabase Migration Guidelines

This document outlines the best practices and workflows for managing Supabase database migrations.

## Important Rules

1. **NEVER run SQL directly in Supabase Dashboard**
   - Always use migrations through the CLI
   - Every change must be tracked and replicable

2. **Always test locally first**
   - Make changes locally
   - Test thoroughly
   - Only then push to remote

## Development Workflow

### 1. Daily Development Flow

```bash
# Start your day with:
git pull                  # Get latest code
supabase db reset        # Reset local DB
supabase migration list  # Verify sync

# When making changes:
supabase migration new my_change
# Edit the migration file
supabase db reset        # Test locally

# When ready to push:
supabase db push         # Push to remote
git add .
git commit -m "Added migration: my_change"
git push
```

### 2. Creating New Migrations

```bash
# Create a new migration
supabase migration new your_migration_name

# Test locally
supabase db reset

# Push to remote
supabase db push
```

### 3. Team Collaboration

When pulling changes from other team members:
```bash
# 1. Pull the latest migrations
git pull

# 2. Reset local database to match remote
supabase db reset

# 3. Verify migrations match
supabase migration list
```

## Regular Maintenance

### 1. Check Migration Status

```bash
# Check migration status regularly
supabase migration list

# If they don't match, pull remote state
supabase db pull
```

### 2. Recovery Steps

If migrations get out of sync:
```bash
# 1. Backup your current migrations
mkdir supabase/migrations_backup
cp supabase/migrations/* supabase/migrations_backup/

# 2. Pull the remote state
supabase db pull

# 3. Reset local database
supabase db reset
```

## Best Practices

### 1. Migration Naming
- Use descriptive names
- Include the purpose of the change
- Examples:
  - ✅ `add_user_profile_fields`
  - ✅ `create_budget_tables`
  - ❌ `update_1`
  - ❌ `fix_stuff`

### 2. Migration Content
- One logical change per migration
- Include both "up" and "down" migrations when possible
- Test migrations with realistic data
- Document complex migrations with comments

### 3. Version Control
- Always commit migration files
- Keep migrations in sync with application code
- Include migration changes in feature branches

## What to Avoid

### 1. Never:
- ❌ Make schema changes directly in production
- ❌ Delete or modify existing migration files
- ❌ Skip migration files in version control
- ❌ Run migrations without testing locally

### 2. Always:
- ✅ Keep migrations in chronological order
- ✅ Test migrations on a copy of production data
- ✅ Back up data before major schema changes
- ✅ Use meaningful migration names

## Emergency Fixes

If things go wrong:

```bash
# 1. Create a backup
cp -r supabase/migrations supabase/migrations_backup

# 2. Reset migration history
supabase migration repair --status reverted <migration_id>

# 3. Create a clean migration
supabase migration new clean_slate

# 4. Reset and test
supabase db reset
```

## Migration File Template

```sql
-- Example migration file structure

-- Up Migration
-- Description: What this migration does
CREATE TABLE IF NOT EXISTS example_table (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add any necessary indexes
CREATE INDEX IF NOT EXISTS idx_example_name ON example_table(name);

-- Add any necessary policies
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON example_table
    FOR SELECT USING (auth.uid()::text = user_id);

-- Down Migration (if needed)
-- DROP TABLE IF EXISTS example_table;
```

## Common Commands Reference

```bash
# Start Supabase locally
supabase start

# Stop Supabase
supabase stop

# Create new migration
supabase migration new my_migration_name

# Reset local database
supabase db reset

# Push migrations to remote
supabase db push

# Pull remote migrations
supabase db pull

# List migrations
supabase migration list

# Repair migration history
supabase migration repair --status reverted <migration_id>
```

Remember: Consistent use of these practices will help maintain a clean and manageable database schema across all environments.
