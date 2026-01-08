# Migration 013 Bug Report - Blocking Critical Issue

## 🐛 Issue Summary
Migration `013_code_examples_plugin.sql` contains SQL syntax errors that cause **all subsequent migrations to fail**, blocking admin user creation, plugin installation, and preventing the app from initializing properly.

---

## 💥 Impact: CRITICAL

### What Breaks:
- ❌ **Admin user is not created** (relies on later migrations)
- ❌ **Contact Form plugin not installed** (migration 030)
- ❌ **AI Search plugin not installed** (migration 027)
- ❌ **Any plugin with migrations fails to initialize**
- ❌ **Fresh database setup is completely broken**
- ❌ **E2E tests fail** (no admin user to login with)
- ❌ **CI/CD pipelines fail** (database setup errors)

### When It Happens:
- ✅ Every fresh `npm run setup:db`
- ✅ Every fresh D1 database creation in CI
- ✅ Every new developer onboarding
- ✅ Every preview deployment with new database

---

## 🔍 Root Cause

The migration contains multi-line `INSERT` statements with embedded code examples that use **single quotes within SQL single-quote strings**:

```sql
-- Line 45-53 (BROKEN)
INSERT OR IGNORE INTO code_examples (title, description, code, language, category, tags, isPublished, sortOrder) VALUES
('React useState Hook',
 'Basic example of using the useState hook in React for managing component state.',
 'import { useState } from ''react'';  -- ⚠️ Double single-quotes for escaping

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}',
 'javascript',
 'react',
 'hooks,state',
 1,
 1);
```

**D1/SQLite Parser Issue:**
- D1's SQL parser **fails to correctly parse** these multi-line strings with embedded quotes
- Even though `''` is the correct SQL escape sequence, the parser gets confused
- Error: `D1_ERROR: unrecognized token: "'import { useState } from ''react'';" at offset 229: SQLITE_ERROR`

---

## 📊 Error Details

### Error Message:
```
[ERROR] [Migration] Error executing statement: INSERT OR IGNORE INTO code_examples (title, description, code, language, category, tags, isPublished...
[ERROR] [Migration] Failed to apply migration 013: D1_ERROR: unrecognized token: "'import { useState } from ''react'';" at offset 229: SQLITE_ERROR
```

### What Happens:
1. Migration 001-012 complete successfully ✅
2. Migration 013 starts executing
3. Parser encounters the multi-line code string
4. **FAILS** with `unrecognized token` error
5. Migration 013 marked as failed
6. **ALL subsequent migrations are skipped** ❌
7. Database is in incomplete state

### Affected Users:
- **All new installations**
- **All CI/CD runs**
- **All developers running `npm run setup:db`**
- **All preview deployments**

---

## ✅ The Fix

### Option 1: Remove Sample Data (Recommended - Simple)
Remove the problematic `INSERT` statements entirely. Sample code examples can be added through the admin UI or seeded separately.

**Benefits:**
- ✅ Simple, safe fix
- ✅ No breaking changes
- ✅ Migrations should be schema-only anyway
- ✅ Sample data can be handled by Seed Data plugin

**Migration 013 Fixed Version:**
```sql
-- Code Examples Plugin Migration
-- Creates code_examples table for the code examples plugin
-- This demonstrates a code-based collection for storing and managing code snippets

CREATE TABLE IF NOT EXISTS code_examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  category TEXT,
  tags TEXT,
  isPublished INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_code_examples_published ON code_examples(isPublished);
CREATE INDEX IF NOT EXISTS idx_code_examples_sort_order ON code_examples(sortOrder);
CREATE INDEX IF NOT EXISTS idx_code_examples_language ON code_examples(language);
CREATE INDEX IF NOT EXISTS idx_code_examples_category ON code_examples(category);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS code_examples_updated_at
  AFTER UPDATE ON code_examples
BEGIN
  UPDATE code_examples SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- Insert plugin record
INSERT OR IGNORE INTO plugins (name, display_name, description, version, status, category, settings) VALUES
('code-examples',
 'Code Examples',
 'Manage code snippets and examples with syntax highlighting support. Perfect for documentation and tutorials.',
 '1.0.0',
 'active',
 'content',
 '{"defaultPublished": true, "supportedLanguages": ["javascript", "typescript", "python", "go", "rust", "java", "php", "ruby", "sql"]}');

-- Note: Sample code examples removed to avoid D1 SQL parsing issues with multi-line strings
-- Users can add their own code examples through the admin interface
```

### Option 2: Use Parameterized Queries (Complex)
Move sample data to a TypeScript migration runner that uses parameterized queries. This requires infrastructure changes.

---

## 🧪 Testing the Fix

### Before Fix:
```bash
cd my-sonicjs-app
rm -rf .wrangler
npm run setup:db
# Output: Migration 013 fails, admin user not created, login broken
```

### After Fix:
```bash
cd my-sonicjs-app
rm -rf .wrangler
npm run setup:db
# Output: All migrations succeed, admin user created, login works
```

### Verification:
```bash
# Check admin user exists
npx wrangler d1 execute sonicjs-worktree-main --local --command "SELECT email FROM users WHERE role='admin';"
# Should output: admin@sonicjs.com

# Check plugin installed
npx wrangler d1 execute sonicjs-worktree-main --local --command "SELECT name, status FROM plugins WHERE name='code-examples';"
# Should output: code-examples | active
```

---

## 🔧 Reproduction Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/lane711/sonicjs.git
   cd sonicjs
   npm install
   ```

2. **Create fresh database**
   ```bash
   cd my-sonicjs-app
   rm -rf .wrangler
   npm run setup:db
   ```

3. **Observe the error**
   ```
   [Migration] Applying 013: Code Examples Plugin
   ✘ [ERROR] [Migration] Error executing statement: INSERT OR IGNORE INTO code_examples...
   ✘ [ERROR] [Migration] Failed to apply migration 013: D1_ERROR: unrecognized token...
   ```

4. **Try to login**
   ```bash
   npm run dev
   # Navigate to http://localhost:8787/auth/login
   # Login with admin@sonicjs.com / sonicjs!
   # Result: Login fails (no admin user exists)
   ```

---

## 📋 Files Affected

- **Primary**: `my-sonicjs-app/migrations/013_code_examples_plugin.sql`
- **Impact**: All migrations 014-030 fail to run

---

## 🚀 Recommended Action

### For Maintainers:
1. Apply the fix (remove sample INSERT statements)
2. Test with fresh D1 database
3. Verify all 27 migrations complete successfully
4. Release as patch version (blocks all new installations)

### For Users (Temporary Workaround):
```bash
# Edit my-sonicjs-app/migrations/013_code_examples_plugin.sql
# Remove the INSERT INTO code_examples statements (lines 44+)
# Keep only the plugin record INSERT and schema creation
# Then run setup:db again
```

---

## 🔗 Related Issues
- Contact Form plugin E2E tests failing (due to no admin user)
- AI Search plugin not initializing (migration never runs)
- Seed Data plugin issues (relies on complete migration chain)

---

## 📝 Priority: CRITICAL

This issue **blocks all fresh installations** and prevents the project from being usable for new users. Should be fixed in the next release.

---

## 🧑‍💻 Proposed Solution (PR Ready)

I have a working fix that:
- ✅ Removes the problematic multi-line INSERT statements
- ✅ Keeps the schema creation (table, indexes, trigger)
- ✅ Keeps the plugin registration
- ✅ Adds a helpful comment explaining why sample data was removed
- ✅ Tested with fresh D1 database - all 27 migrations succeed

Ready to submit as PR to upstream!
