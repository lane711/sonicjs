import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
// import { z } from 'zod';

// Import users table from main schema for foreign key references
import { users } from '../../../db/schema';

// Email themes for reusable email layouts
export const emailThemes = sqliteTable('email_themes', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  htmlTemplate: text('html_template').notNull(), // HTML layout with placeholders
  cssStyles: text('css_styles').notNull(), // Custom CSS styles
  variables: text('variables', { mode: 'json' }), // Available template variables
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Email templates for specific email types
export const emailTemplates = sqliteTable('email_templates', {
  id: text('id').primaryKey(),
  themeId: text('theme_id').notNull().references(() => emailThemes.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // e.g., 'forgot-password', 'welcome'
  subject: text('subject').notNull(),
  markdownContent: text('markdown_content').notNull(), // Markdown content for email body
  variables: text('variables', { mode: 'json' }), // Template-specific variables
  metadata: text('metadata', { mode: 'json' }), // Additional configuration
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  version: integer('version').notNull().default(1),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Email logs for tracking delivery and engagement
export const emailLogs = sqliteTable('email_logs', {
  id: text('id').primaryKey(),
  templateId: text('template_id').references(() => emailTemplates.id),
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  status: text('status').notNull(), // 'pending', 'sent', 'delivered', 'failed'
  providerId: text('provider_id'), // External service message ID
  errorMessage: text('error_message'),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  deliveredAt: integer('delivered_at', { mode: 'timestamp' }),
  openedAt: integer('opened_at', { mode: 'timestamp' }),
  clickedAt: integer('clicked_at', { mode: 'timestamp' }),
  metadata: text('metadata', { mode: 'json' }), // Additional tracking data
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Email variables for template system
export const emailVariables = sqliteTable('email_variables', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  dataType: text('data_type').notNull(), // 'string', 'number', 'date', 'boolean'
  defaultValue: text('default_value'),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false), // System vs custom variables
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Zod schemas for validation
export const insertEmailThemeSchema = createInsertSchema(emailThemes);
export const selectEmailThemeSchema = createSelectSchema(emailThemes);
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates);
export const selectEmailTemplateSchema = createSelectSchema(emailTemplates);
export const insertEmailLogSchema = createInsertSchema(emailLogs);
export const selectEmailLogSchema = createSelectSchema(emailLogs);
export const insertEmailVariableSchema = createInsertSchema(emailVariables);
export const selectEmailVariableSchema = createSelectSchema(emailVariables);

// TypeScript types
export type EmailTheme = typeof emailThemes.$inferSelect;
export type NewEmailTheme = typeof emailThemes.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;
export type EmailLog = typeof emailLogs.$inferSelect;
export type NewEmailLog = typeof emailLogs.$inferInsert;
export type EmailVariable = typeof emailVariables.$inferSelect;
export type NewEmailVariable = typeof emailVariables.$inferInsert;