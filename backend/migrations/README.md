# Database Migrations

This folder contains all SQL migration files for the EssLearn database.

## File Naming Convention

Each migration file must follow this naming pattern:
```
NNN_description.sql
```

Where:
- `NNN` = Sequential number (001, 002, 003, etc.)
- `_description` = Brief description of the changes

**Examples:**
- `001_initial_schema.sql` - Initial database setup
- `002_add_roadmaps.sql` - Add roadmap tables
- `003_add_indexes.sql` - Add performance indexes

## How Migrations Work

1. **Migration Execution Order**: Files are sorted alphabetically, so sequential numbering ensures correct order
2. **Tracking**: Applied migrations are recorded in the `__EFMigrationsHistory` table
3. **Idempotency**: Each migration is applied only once
4. **Automatic**: Migrations run automatically when the application starts (via `DatabaseMigrator` service)

## Running Migrations Manually

### Using psql
```bash
psql -U postgres -d esslearn -f migrations/001_initial_schema.sql
```

### Using Docker
```bash
docker exec -it esslearn-db psql -U postgres -d esslearn -f /app/migrations/001_initial_schema.sql
```

### All migrations at once
```bash
for file in migrations/*.sql; do
    echo "Applying $file..."
    psql -U postgres -d esslearn -f "$file"
done
```

## Creating a New Migration

### 1. Create the SQL file
```bash
# Create next sequential file
touch migrations/NNN_your_description.sql
```

### 2. Write your migration
```sql
-- migrations/002_add_column.sql
-- Description: Add new column to existing table
-- Author: Your Name
-- Date: 2026-04-28

ALTER TABLE "Videos" ADD COLUMN "rating" DECIMAL(3,2);
CREATE INDEX "IX_Videos_Rating" ON "Videos"("rating");
```

### 3. Test locally
```bash
psql -U postgres -d esslearn -f migrations/002_add_column.sql
```

### 4. Commit and push
```bash
git add migrations/002_add_column.sql
git commit -m "Migration: Add rating column to Videos"
git push
```

## Migration Best Practices

✅ **DO:**
- Use `IF NOT EXISTS` / `IF EXISTS` for idempotent operations
- Keep migrations focused and atomic
- Add comments explaining complex changes
- Test migrations on a local copy before deploying
- Use transactions for complex operations
- Include rollback strategy in comments
- Name files sequentially for automatic ordering

❌ **DON'T:**
- Rename or modify existing migration files
- Skip numbering sequences
- Run migrations manually in production without testing
- Make breaking changes without clear migration path
- Mix schema changes with data changes (when possible)

## Examples

### Adding a Table
```sql
-- 002_create_users_table.sql
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" SERIAL PRIMARY KEY,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Adding a Column with Constraint
```sql
-- 003_add_status_to_videos.sql
ALTER TABLE "Videos" 
ADD COLUMN IF NOT EXISTS "Status" VARCHAR(50) NOT NULL DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS "IX_Videos_Status" ON "Videos"("Status");
```

### Creating Foreign Key
```sql
-- 004_add_user_to_videos.sql
ALTER TABLE "Videos"
ADD COLUMN IF NOT EXISTS "UserId" INTEGER REFERENCES "Users"("Id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "IX_Videos_UserId" ON "Videos"("UserId");
```

### Data Migration
```sql
-- 005_populate_status.sql
BEGIN;
UPDATE "Videos" SET "Status" = 'active' WHERE "CreatedAt" > NOW() - INTERVAL '7 days';
UPDATE "Videos" SET "Status" = 'archived' WHERE "CreatedAt" <= NOW() - INTERVAL '7 days';
COMMIT;
```

## Rollback Procedure

If a migration needs to be rolled back:

1. **Create a rollback migration:**
```sql
-- 006_rollback_previous_change.sql
ALTER TABLE "Videos" DROP COLUMN IF EXISTS "Status";
```

2. **Never delete migrations** - add new rollback migrations instead

3. **Deploy the rollback migration** like any other migration

## Troubleshooting

### Migration didn't run
Check the `__EFMigrationsHistory` table:
```sql
SELECT * FROM __EFMigrationsHistory ORDER BY applied_at DESC;
```

### Force re-run a migration
Delete the record and re-run the app:
```sql
DELETE FROM __EFMigrationsHistory WHERE migration_name = '002_add_column.sql';
```

### Permission errors
Ensure the PostgreSQL user has DDL permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE esslearn TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
```

## References

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Migration Best Practices: https://wiki.postgresql.org/wiki/Safely_renaming_tables
