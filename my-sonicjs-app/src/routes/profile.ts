/**
 * User Profile Routes
 *
 * CRUD API for user profiles. These routes allow authenticated users
 * to manage their extended profile data.
 *
 * DYNAMIC SCHEMA: These routes automatically adapt to schema changes.
 * Add/remove columns in user-profiles.ts and they'll be available
 * in the API without modifying this file.
 *
 * Routes:
 * - GET  /api/profile      - Get current user's profile
 * - PUT  /api/profile      - Create or replace profile
 * - PATCH /api/profile     - Partial update profile
 * - DELETE /api/profile    - Delete profile
 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@sonicjs-cms/core';
import type { Bindings, Variables } from '@sonicjs-cms/core';
import { userProfiles, type NewUserProfile } from '../db/schema/user-profiles';

// Generate a simple unique ID
function generateId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get valid column names from schema (excludes id, userId, createdAt, updatedAt)
const schemaColumns = Object.keys(userProfiles).filter(
  (key) => !['id', 'userId', 'createdAt', 'updatedAt'].includes(key)
);

// Map camelCase to snake_case for request body flexibility
function normalizeFieldName(key: string): string {
  // Convert snake_case to camelCase
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Filter and normalize request body to only include valid schema columns
function filterBodyToSchema(body: Record<string, unknown>): Partial<NewUserProfile> {
  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    const normalizedKey = normalizeFieldName(key);
    if (schemaColumns.includes(normalizedKey)) {
      filtered[normalizedKey] = value;
    }
  }

  return filtered as Partial<NewUserProfile>;
}

// Create routes with proper typing for Bindings/Variables
const profileRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply authentication to all routes
profileRoutes.use('*', requireAuth());

/**
 * GET /api/profile - Get current user's profile
 */
profileRoutes.get('/', async (c) => {
  const user = c.get('user');
  const db = drizzle(c.env.DB);

  try {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user!.userId))
      .limit(1);

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
  const db = drizzle(c.env.DB);

  try {
    const body = await c.req.json();
    const now = Date.now();

    // Filter body to only valid schema columns
    const profileData = filterBodyToSchema(body);

    // Check if profile exists
    const [existing] = await db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .where(eq(userProfiles.userId, user!.userId))
      .limit(1);

    if (existing) {
      // Update existing profile
      const [updated] = await db
        .update(userProfiles)
        .set({
          ...profileData,
          updatedAt: now,
        })
        .where(eq(userProfiles.userId, user!.userId))
        .returning();

      return c.json(updated);
    } else {
      // Create new profile
      const [created] = await db
        .insert(userProfiles)
        .values({
          id: generateId(),
          userId: user!.userId,
          ...profileData,
          createdAt: now,
          updatedAt: now,
        } as NewUserProfile)
        .returning();

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
  const db = drizzle(c.env.DB);

  try {
    const body = await c.req.json();

    // Filter body to only valid schema columns
    const profileData = filterBodyToSchema(body);

    if (Object.keys(profileData).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    // Check if profile exists
    const [existing] = await db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .where(eq(userProfiles.userId, user!.userId))
      .limit(1);

    if (!existing) {
      return c.json({ error: 'Profile not found. Use PUT to create.' }, 404);
    }

    // Update with provided fields
    const [updated] = await db
      .update(userProfiles)
      .set({
        ...profileData,
        updatedAt: Date.now(),
      })
      .where(eq(userProfiles.userId, user!.userId))
      .returning();

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
  const db = drizzle(c.env.DB);

  try {
    const result = await db
      .delete(userProfiles)
      .where(eq(userProfiles.userId, user!.userId))
      .returning();

    if (result.length === 0) {
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
