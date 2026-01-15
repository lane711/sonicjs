/**
 * User Profile Routes
 *
 * CRUD API for user profiles. These routes allow authenticated users
 * to manage their extended profile data.
 *
 * Routes:
 * - GET  /api/profile      - Get current user's profile
 * - PUT  /api/profile      - Create or replace profile
 * - PATCH /api/profile     - Partial update profile
 * - DELETE /api/profile    - Delete profile
 */

import { Hono } from 'hono';
import { requireAuth } from '@sonicjs-cms/core';
import type { Bindings, Variables } from '@sonicjs-cms/core';

// Generate a simple unique ID
function generateId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Create routes with proper typing for Bindings/Variables
// The type assertion at export handles config.routes compatibility
const profileRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply authentication to all routes
profileRoutes.use('*', requireAuth());

/**
 * GET /api/profile - Get current user's profile
 */
profileRoutes.get('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const profile = await db
      .prepare(
        `SELECT id, user_id, display_name, bio, company, job_title,
                website, location, date_of_birth, created_at, updated_at
         FROM user_profiles
         WHERE user_id = ?`
      )
      .bind(user!.userId)
      .first();

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

/**
 * PUT /api/profile - Create or replace profile
 */
profileRoutes.put('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const now = Date.now();

    // Check if profile exists
    const existing = await db
      .prepare('SELECT id FROM user_profiles WHERE user_id = ?')
      .bind(user!.userId)
      .first();

    if (existing) {
      // Update existing profile
      await db
        .prepare(
          `UPDATE user_profiles
           SET display_name = ?, bio = ?, company = ?, job_title = ?,
               website = ?, location = ?, date_of_birth = ?, updated_at = ?
           WHERE user_id = ?`
        )
        .bind(
          body.displayName ?? body.display_name ?? null,
          body.bio ?? null,
          body.company ?? null,
          body.jobTitle ?? body.job_title ?? null,
          body.website ?? null,
          body.location ?? null,
          body.dateOfBirth ?? body.date_of_birth ?? null,
          now,
          user!.userId
        )
        .run();

      // Fetch and return updated profile
      const updated = await db
        .prepare('SELECT * FROM user_profiles WHERE user_id = ?')
        .bind(user!.userId)
        .first();

      return c.json(updated);
    } else {
      // Create new profile
      const id = generateId();

      await db
        .prepare(
          `INSERT INTO user_profiles
           (id, user_id, display_name, bio, company, job_title, website, location, date_of_birth, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          id,
          user!.userId,
          body.displayName ?? body.display_name ?? null,
          body.bio ?? null,
          body.company ?? null,
          body.jobTitle ?? body.job_title ?? null,
          body.website ?? null,
          body.location ?? null,
          body.dateOfBirth ?? body.date_of_birth ?? null,
          now,
          now
        )
        .run();

      // Fetch and return created profile
      const created = await db
        .prepare('SELECT * FROM user_profiles WHERE id = ?')
        .bind(id)
        .first();

      return c.json(created, 201);
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    return c.json({ error: 'Failed to save profile' }, 500);
  }
});

/**
 * PATCH /api/profile - Partial update profile
 */
profileRoutes.patch('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const body = await c.req.json();

    // Check if profile exists
    const existing = await db
      .prepare('SELECT * FROM user_profiles WHERE user_id = ?')
      .bind(user!.userId)
      .first();

    if (!existing) {
      return c.json({ error: 'Profile not found. Use PUT to create.' }, 404);
    }

    // Build dynamic update query for provided fields only
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    const fieldMap: Record<string, string> = {
      displayName: 'display_name',
      display_name: 'display_name',
      bio: 'bio',
      company: 'company',
      jobTitle: 'job_title',
      job_title: 'job_title',
      website: 'website',
      location: 'location',
      dateOfBirth: 'date_of_birth',
      date_of_birth: 'date_of_birth',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (key in body) {
        updates.push(`${column} = ?`);
        values.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    // Add updated_at
    updates.push('updated_at = ?');
    values.push(Date.now());

    // Add user_id for WHERE clause
    values.push(user!.userId);

    await db
      .prepare(`UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = ?`)
      .bind(...values)
      .run();

    // Fetch and return updated profile
    const updated = await db
      .prepare('SELECT * FROM user_profiles WHERE user_id = ?')
      .bind(user!.userId)
      .first();

    return c.json(updated);
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

/**
 * DELETE /api/profile - Delete profile
 */
profileRoutes.delete('/', async (c) => {
  const user = c.get('user');
  const db = c.env.DB;

  try {
    const result = await db
      .prepare('DELETE FROM user_profiles WHERE user_id = ?')
      .bind(user!.userId)
      .run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ success: true, message: 'Profile deleted' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return c.json({ error: 'Failed to delete profile' }, 500);
  }
});

// Export with type assertion for config.routes compatibility
export default profileRoutes as unknown as Hono;
