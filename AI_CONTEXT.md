# AI Context & Reference Guide

**Purpose:** Centralized documentation for AI assistants working on this SonicJS fork  
**Last Updated:** January 8, 2026  
**Maintained By:** Mark McIntosh (@mmcintosh)

---

## 🎯 Quick Reference

### Key Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `SONICJS_FIELD_TYPES_REFERENCE.md` | Complete field types guide | Building/modifying collections |
| `SETUP_GITHUB_ACTIONS.md` | CI/CD setup instructions | Setting up automated testing |
| `INFOWALL_IMPLEMENTATION_GUIDE.md` | Personal production deployment | Deploying to infowall.net |
| `docs/ai/project-plan.md` | Strategic plans & goals | Understanding project direction |
| `docs/ai/claude-memory.json` | Persistent AI memory | Understanding past decisions |

### Official External Documentation

- **Main Docs**: https://sonicjs.com/
- **Collections**: https://sonicjs.com/collections
- **API Reference**: https://sonicjs.com/api
- **GitHub**: https://github.com/lane711/sonicjs

---

## 🏗️ Project Structure

```
sonicjs/
├── packages/core/          # Core CMS functionality
│   ├── src/
│   │   ├── db/            # Drizzle ORM schemas
│   │   ├── plugins/       # Core plugins
│   │   ├── routes/        # API & admin routes
│   │   ├── middleware/    # Auth, caching, logging
│   │   ├── templates/     # HTML rendering
│   │   └── types/         # TypeScript types
│   └── migrations/        # Core migrations
│
├── my-sonicjs-app/        # Sample application
│   ├── src/
│   │   ├── collections/   # App-specific collections
│   │   ├── plugins/       # App-specific plugins
│   │   └── index.ts       # App entry point
│   ├── migrations/        # App-specific migrations
│   └── wrangler.toml      # Cloudflare Workers config
│
├── tests/e2e/             # Playwright E2E tests
├── docs/                  # Internal documentation
└── www/                   # Marketing site (Next.js)
```

---

## 🔑 Critical Technical Details

### Authentication System

**Cookie Name:** `auth_token`  
**Cookie Settings:**
- `httpOnly: true` (JavaScript can read via document.cookie but browser won't auto-send in some cases)
- `secure: true` (HTTPS only)
- `sameSite: 'Strict'` (⚠️ Blocks cookies in fetch() requests!)

**Authentication Flow:**
1. User logs in → JWT token generated
2. Token stored in `auth_token` cookie
3. Middleware checks (in order):
   - `Authorization: Bearer <token>` header (line 85 of auth.ts)
   - `auth_token` cookie (line 89 of auth.ts)

**SameSite=Strict Workaround:**
```javascript
// Manually extract cookie and send in Authorization header
const authToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('auth_token='))
  ?.split('=')[1];

headers['Authorization'] = `Bearer ${authToken}`;
```

### Database Architecture

**Engine:** Cloudflare D1 (SQLite-compatible)  
**ORM:** Drizzle  
**Migrations:** Auto-run on startup  

**Key Tables:**
- `users` - User accounts and auth
- `content` - All content (unified table)
- `collections` - Collection schemas
- `plugins` - Plugin registry
- `settings` - Plugin settings (JSON)

**Important:**
- Content is stored in a single table with `collection_id` discriminator
- Field data stored in `data` JSON column
- Each worktree gets its own D1 database (name pattern: `sonicjs-worktree-{branch-name}`)

### Cloudflare Bindings

**Required Bindings in wrangler.toml:**
```toml
[[d1_databases]]
binding = "DB"              # Database

[[r2_buckets]]
binding = "MEDIA_BUCKET"    # File storage

[[kv_namespaces]]
binding = "CACHE_KV"        # Cache

[[vectorize]]
binding = "VECTORIZE_INDEX" # AI Search (optional)

[ai]
binding = "AI"              # Cloudflare AI (optional)
```

**Important:** GitHub Actions creates resources dynamically:
- D1 database: Created per PR with name `sonicjs-pr-{branch}`
- KV/R2: Shared across all preview deployments
- API tokens must have permissions for D1, KV, R2, Workers

---

## 🐛 Common Issues & Solutions

### 1. Migration 013 SQL Error
**Error:** `unrecognized token: "'import { useState } from ''react'';"'`  
**Cause:** Multi-line string literals with embedded quotes  
**Solution:** Remove problematic INSERT statements with code samples  
**File:** `my-sonicjs-app/migrations/013_code_examples_plugin.sql`

### 2. Fetch Returns 401 in Browser
**Error:** `Expected: 200, Received: 401`  
**Cause:** SameSite=Strict prevents cookies in fetch() requests  
**Solution:** Manually send auth token in Authorization header (see above)  
**Files:** Plugin settings pages with form submission

### 3. E2E Tests Reset Local Database
**Error:** All data deleted after running `npm run e2e`  
**Cause:** Tests run against local `.wrangler` directory  
**Solution:** Use `npm run setup:db` to recreate, or avoid deleting `.wrangler`  
**Memory:** NEVER suggest `rm -rf .wrangler` as cleanup

### 4. Vectorize Binding Not Found
**Error:** `env.VECTORIZE_INDEX` is undefined  
**Cause:** Incorrect binding name or not configured in wrangler.toml  
**Solution:** Set `binding = "VECTORIZE_INDEX"` and `remote = true`  
**File:** `my-sonicjs-app/wrangler.toml`

### 5. Contact Form Test Failing
**Error:** Google Maps iframe not visible  
**Cause:** Settings save request returning 401  
**Root Cause:** SameSite=Strict cookie policy (see #2)  
**Solution:** Include Authorization header with Bearer token

---

## 🧪 Testing

### Commands
```bash
# Unit tests
npm test

# E2E tests (all)
npm run e2e

# E2E smoke tests (subset)
npm run e2e:smoke

# E2E with UI (debugging)
npm run e2e:ui

# Type checking
npm run type-check
```

### E2E Test Requirements
- Dev server must be running on port 8787
- Fresh database with admin user
- Required migrations applied
- Plugins activated as needed

### CI/CD Flow (GitHub Actions)
1. Checkout code
2. Install dependencies (`npm ci`)
3. Run unit tests (`npm test`)
4. Build core (`npm run build:core`)
5. Create fresh D1 database on Cloudflare
6. Run migrations against remote D1
7. Deploy to Cloudflare Workers preview
8. Install Playwright browsers
9. Run E2E tests against preview URL
10. Upload test artifacts (videos, traces)

**Key Files:**
- `.github/workflows/pr-tests.yml` - Main CI workflow
- `tests/playwright.config.ts` - Playwright config
- `tests/e2e/` - Test specs

---

## 📦 Plugin Development

### Plugin Structure
```typescript
// my-sonicjs-app/src/plugins/my-plugin/index.ts
import { PluginBuilder } from '@sonicjs-cms/core'

export function createMyPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'my-plugin',
    version: '1.0.0',
    description: 'Plugin description'
  })

  // Routes
  builder.addRoute('/admin/plugins/my-plugin', adminRoutes, {
    requiresAuth: true,
    priority: 100
  })

  // Admin page & menu
  builder.addAdminPage('/my-plugin', 'My Plugin', 'MyPlugin')
  builder.addMenuItem('My Plugin', '/admin/plugins/my-plugin')

  // Lifecycle hooks
  builder.lifecycle({
    install: async (context) => { /* Setup */ },
    activate: async (context) => { /* Enable */ },
    deactivate: async (context) => { /* Disable */ },
    uninstall: async (context) => { /* Cleanup */ }
  })

  return builder.build()
}
```

### Plugin Settings Pattern
```typescript
// Store settings
await db.insert(settings).values({
  plugin_id: 'my-plugin',
  settings: JSON.stringify({ key: 'value' })
})

// Retrieve settings
const result = await db.select()
  .from(settings)
  .where(eq(settings.plugin_id, 'my-plugin'))
  .get()
```

---

## 🔍 Debugging Strategies

### 1. Check Logs
```bash
# Local dev server logs
# Watch for migration errors, plugin initialization, route mounting

# CI logs
# Check GitHub Actions → specific job → expand steps
```

### 2. Query Database Directly
```bash
# Local (uses .wrangler/state/v3/d1/)
npx wrangler d1 execute sonicjs-worktree-{branch} --local --command="SELECT * FROM users"

# Remote
npx wrangler d1 execute sonicjs-pr-{branch} --remote --command="SELECT * FROM settings"
```

### 3. Check Bindings
```typescript
// In worker code
console.log('DB available:', !!c.env.DB)
console.log('KV available:', !!c.env.CACHE_KV)
console.log('AI available:', !!c.env.AI)
console.log('Vectorize available:', !!c.env.VECTORIZE_INDEX)
```

### 4. Browser DevTools
- Network tab → Check request/response
- Console → Check for JavaScript errors
- Application → Check cookies (auth_token)
- Application → Check Local Storage

---

## 🚀 Deployment Environments

### Local Development
- URL: `http://localhost:8787`
- Database: `.wrangler/state/v3/d1/sonicjs-worktree-{branch}`
- KV: Local simulation
- R2: Local simulation

### GitHub Actions Preview
- URL: `https://sonicjs-pr-{branch}.{account}.workers.dev`
- Database: Remote D1 (created per branch)
- KV/R2: Shared preview resources
- Duration: Persists until manually deleted

### Production (infowall.net)
- URL: `https://infowall.net`
- Database: Dedicated production D1
- KV/R2: Dedicated production resources
- Custom domain routing via Cloudflare

**Resource Naming:**
- Development: `sonicjs-worktree-*`
- Preview: `sonicjs-pr-*`
- Production: `infowall-*`

---

## 📚 Field Types Quick Reference

See `SONICJS_FIELD_TYPES_REFERENCE.md` for complete details.

**30 Available Types:**
- Text: string, textarea, email, url, slug, color
- Rich: richtext, markdown
- Numeric: number
- Date/Time: date, datetime
- Boolean: boolean, checkbox
- Selection: select, multiselect, radio
- Media: media, file
- Relationship: reference
- Structured: json, array, object

**Common Attributes:**
- `type` (required)
- `title`, `description`
- `required`, `default`
- `placeholder`, `helpText`
- `min`, `max`, `minLength`, `maxLength`
- `pattern` (regex validation)
- `enum`, `enumLabels` (for select types)

---

## 🎓 Learning Resources

### When Starting New Work
1. Check this file for relevant context
2. Read specific reference docs (field types, API, etc.)
3. Search codebase for similar implementations
4. Check test files for usage examples
5. Review official docs at sonicjs.com

### Code Search Strategies
```bash
# Find implementations
grep -r "requireAuth" packages/core/src/

# Find usages
grep -r "createPluginBuilder" my-sonicjs-app/

# Find tests
grep -r "describe('Auth" tests/

# Find types
grep -r "type.*Config" packages/core/src/types/
```

---

## 🔄 Workflow Best Practices

### Before Making Changes
1. ✅ Pull latest from upstream: `git pull upstream main`
2. ✅ Merge into feature branch: `git merge upstream/main`
3. ✅ Rebuild: `npm run build:core`
4. ✅ Check for conflicts
5. ✅ Run tests: `npm test && npm run e2e`

### After Making Changes
1. ✅ Type check: `npm run type-check`
2. ✅ Run affected tests
3. ✅ Update documentation if needed
4. ✅ Commit with descriptive message
5. ✅ Push to fork: `git push origin {branch}`
6. ✅ Monitor GitHub Actions results

### Git Commit Message Format
```
<type>: <short description>

- Bullet summary of key changes
- Include technical details
- Note any breaking changes

Fixes #{issue-number}

Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:** fix, feat, refactor, test, docs, chore

---

## 🎯 Current Active Work

### In Progress
- [ ] AI Search plugin (Draft PR #XXX)
- [ ] Contact Form plugin fixes (PR #445)
- [ ] Turnstile plugin (PR #466)

### Planned
- [ ] Personal production instance (infowall.net)
- [ ] Custom modern theme
- [ ] Public search UI component

### Completed
- [x] GitHub Actions CI/CD setup
- [x] Migration 013 SQL syntax fix
- [x] Contact Form settings URL fix
- [x] SameSite=Strict auth workaround
- [x] Field types reference guide

---

## 💡 AI Assistant Guidelines

### When Working on This Project

1. **Always reference this file first** for context and common issues
2. **Check SONICJS_FIELD_TYPES_REFERENCE.md** when working with collections
3. **Search codebase before making assumptions** about how things work
4. **Test changes locally** before pushing to CI
5. **Document new patterns** by updating this file
6. **Commit often** with descriptive messages
7. **Monitor CI results** and address failures promptly

### Problem-Solving Approach

1. Reproduce the issue locally if possible
2. Check "Common Issues" section above
3. Search codebase for similar implementations
4. Review relevant documentation (this file, official docs, API reference)
5. Add diagnostic logging to understand behavior
6. Implement fix with error handling
7. Add test coverage for the fix
8. Document the solution in this file

### Testing Philosophy

- **Unit tests**: Test business logic in isolation
- **E2E tests**: Test user workflows end-to-end
- **CI tests**: Validate changes in production-like environment
- **Always add tests** for bugs fixed or features added

---

## 📞 Getting Help

1. **Search this file** for relevant keywords
2. **Check official docs** at https://sonicjs.com
3. **Search codebase** for similar implementations
4. **Review test files** for usage examples
5. **Check GitHub Issues** for known problems
6. **Ask in Discord** (link in official docs)

---

**Last Updated:** January 8, 2026  
**Maintainer:** Mark McIntosh  
**AI Context Version:** 1.0
