# User Profiles Table Implementation Plan

## Overview

Add a `user_profiles` table to the **app template** (not core) that allows developers to store user profile data (payment plan, company, bio, etc.). By placing this in the app template, developers have full control to add whatever columns they need.

## Design Decisions

### App Template vs Core

| Aspect | In Core | In App Template ✓ |
|--------|---------|-------------------|
| Customization | Hard - requires forking | Easy - just edit the file |
| Schema control | Core dictates structure | Developer owns entirely |
| Core updates | Could conflict with customizations | No conflicts |
| Separation | Mixes auth with app data | Clean separation |

**Conclusion**: Core handles authentication, app handles profile data.

### Explicit Columns vs JSON Field

| Aspect | JSON `data` field | Explicit columns ✓ |
|--------|-------------------|-------------------|
| Queryable | No (inefficient) | Yes (indexed) |
| Type safety | Weak | Strong |
| Schema clarity | Hidden in blob | Visible |
| Adding fields | No migration | Migration required |

**Conclusion**: Since developers own the schema and migrations, explicit columns are simpler and better. No JSON field needed.

## Requirements

- [ ] Create `user_profiles` table schema in app template
- [ ] Create database migration in app template
- [ ] Add example API routes for profile CRUD
- [ ] Document the pattern

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     packages/core                            │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │   users     │  │   auth      │                           │
│  │   table     │  │   routes    │                           │
│  └─────────────┘  └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ references users.id
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    my-sonicjs-app                            │
│  ┌─────────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  user_profiles  │  │   profile   │  │    profile      │  │
│  │     table       │  │   routes    │  │   migration     │  │
│  │  (customizable) │  │   (CRUD)    │  │                 │  │
│  └─────────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `my-sonicjs-app/src/db/schema/user-profiles.ts` | Create | Profile table schema |
| `my-sonicjs-app/src/db/schema/index.ts` | Modify | Export user profiles schema |
| `my-sonicjs-app/src/db/migrations/001_user_profiles.sql` | Create | Migration for profile table |
| `my-sonicjs-app/src/routes/profile.ts` | Create | Example CRUD routes |
| `my-sonicjs-app/src/index.ts` | Modify | Register profile routes |

### Database Schema (App Template)

**File: `my-sonicjs-app/src/db/schema/user-profiles.ts`**

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { users } from '@sonicjs/core/db/schema';
import { createId } from '@paralleldrive/cuid2';

/**
 * User Profiles Table
 *
 * Customize this schema for your app's needs!
 * Add, remove, or modify columns as needed.
 *
 * Examples of fields you might add:
 * - displayName, avatar, bio
 * - company, jobTitle, website
 * - paymentPlan, subscriptionStatus
 * - dateOfBirth, location, timezone
 */
export const userProfiles = sqliteTable('user_profiles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  // ─────────────────────────────────────────────────────────
  // Add your app-specific columns here:
  // ─────────────────────────────────────────────────────────
  displayName: text('display_name'),
  bio: text('bio'),
  company: text('company'),
  jobTitle: text('job_title'),
  website: text('website'),
  location: text('location'),
  dateOfBirth: integer('date_of_birth'),
  // ─────────────────────────────────────────────────────────

  createdAt: integer('created_at')
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at')
    .notNull()
    .$defaultFn(() => Date.now()),
});

// Drizzle relations
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));
```

### Migration (App Template)

**File: `my-sonicjs-app/src/db/migrations/001_user_profiles.sql`**

```sql
-- User Profiles Table
-- Stores extended user profile data separate from auth concerns
-- Customize columns as needed for your app

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Add your columns here:
  display_name TEXT,
  bio TEXT,
  company TEXT,
  job_title TEXT,
  website TEXT,
  location TEXT,
  date_of_birth INTEGER,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
```

### Example API Routes (App Template)

**File: `my-sonicjs-app/src/routes/profile.ts`**

```typescript
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { userProfiles } from '../db/schema/user-profiles';
import { requireAuth } from '@sonicjs/core/middleware/auth';

const app = new Hono();

// Get current user's profile
app.get('/api/profile', requireAuth(), async (c) => {
  const user = c.get('user');
  const db = c.get('db');

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) {
    return c.json(null, 404);
  }

  return c.json(profile);
});

// Create or update profile
app.put('/api/profile', requireAuth(), async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  const body = await c.req.json();

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (existing) {
    const updated = await db
      .update(userProfiles)
      .set({
        ...body,
        updatedAt: Date.now(),
      })
      .where(eq(userProfiles.userId, user.id))
      .returning();

    return c.json(updated[0]);
  } else {
    const created = await db
      .insert(userProfiles)
      .values({
        userId: user.id,
        ...body,
      })
      .returning();

    return c.json(created[0], 201);
  }
});

// Partial update
app.patch('/api/profile', requireAuth(), async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  const body = await c.req.json();

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!existing) {
    return c.json({ error: 'Profile not found' }, 404);
  }

  const updated = await db
    .update(userProfiles)
    .set({
      ...body,
      updatedAt: Date.now(),
    })
    .where(eq(userProfiles.userId, user.id))
    .returning();

  return c.json(updated[0]);
});

// Delete profile
app.delete('/api/profile', requireAuth(), async (c) => {
  const user = c.get('user');
  const db = c.get('db');

  await db
    .delete(userProfiles)
    .where(eq(userProfiles.userId, user.id));

  return c.json({ success: true });
});

export default app;
```

## Implementation Steps

1. **App Template - Database Layer**
   - Create `user-profiles.ts` schema file
   - Update schema index to export profiles
   - Create migration SQL file

2. **App Template - API Layer**
   - Create `profile.ts` routes file
   - Register routes in main app

3. **Documentation**
   - Add "Extending Users with Profiles" guide
   - Document customization patterns

4. **GitHub Issue**
   - Update issue #506
   - Close when complete

## Testing Strategy

### Unit Tests

- Test file: `my-sonicjs-app/src/routes/profile.test.ts`
- Test cases:
  - [ ] GET returns 404 when no profile exists
  - [ ] GET returns profile data for user
  - [ ] PUT creates new profile
  - [ ] PUT updates existing profile
  - [ ] PATCH updates specific fields
  - [ ] PATCH returns 404 if no profile
  - [ ] DELETE removes profile
  - [ ] Auth required for all endpoints

### E2E Tests

- Test file: `tests/e2e/13-user-profile.spec.ts`
- Test scenarios:
  - [ ] User can create profile via API
  - [ ] User can update profile via API
  - [ ] User can partially update profile
  - [ ] Profile persists across sessions
  - [ ] Unauthorized requests are rejected

## Usage Examples

### Basic Usage
```typescript
// Get profile
const res = await fetch('/api/profile', {
  headers: { Authorization: `Bearer ${token}` }
});
const profile = await res.json();

// Create/update profile
await fetch('/api/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    displayName: 'Jane Doe',
    company: 'Acme Inc',
    bio: 'Software developer'
  })
});

// Partial update
await fetch('/api/profile', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    location: 'San Francisco'
  })
});
```

### Querying with Profile
```typescript
// Get user with profile using Drizzle relations
const userWithProfile = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    profile: true,
  },
});

console.log(userWithProfile?.profile?.company);
```

### Adding New Columns

When you need a new field, just:

1. Add the column to the schema:
```typescript
// in user-profiles.ts
paymentPlan: text('payment_plan'),
```

2. Create a migration:
```sql
ALTER TABLE user_profiles ADD COLUMN payment_plan TEXT;
```

3. Run the migration and you're done!

## Risks & Considerations

1. **Developer must set up manually** - But it's in the template and well-documented
2. **No automatic profile creation** - App decides when/if to create profiles
3. **App responsible for migrations** - Follows existing pattern for app schemas

## Documentation Outline

### Guide: "Extending Users with Profiles"

1. Introduction - Why profiles are in app, not core
2. Quick Start - The template includes a working example
3. Customizing the Schema - Adding/removing columns
4. API Routes - CRUD operations
5. Querying - Using Drizzle relations
6. Examples - Common patterns

## GitHub Issue Update

Update issue #506 to reflect:
- Simple schema with explicit columns (no JSON field)
- Profiles live in app template for full customization
- Link to documentation guide

## Approval

- [ ] Plan reviewed and approved by user
