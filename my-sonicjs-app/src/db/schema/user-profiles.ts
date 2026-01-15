/**
 * User Profiles Table Schema
 *
 * This table stores extended user profile data separate from authentication.
 * Customize the columns below for your app's specific needs.
 *
 * Examples of fields you might add:
 * - paymentPlan, subscriptionStatus, stripeCustomerId
 * - socialLinks (twitter, linkedin, github)
 * - preferences, settings
 * - Any app-specific user data
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { users } from '@sonicjs-cms/core';

export const userProfiles = sqliteTable('user_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  // ─────────────────────────────────────────────────────────
  // Customize these columns for your app:
  // ─────────────────────────────────────────────────────────
  displayName: text('display_name'),
  bio: text('bio'),
  company: text('company'),
  jobTitle: text('job_title'),
  website: text('website'),
  location: text('location'),
  dateOfBirth: integer('date_of_birth'),
  // ─────────────────────────────────────────────────────────

  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Drizzle relations
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

// TypeScript type for the profile
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
