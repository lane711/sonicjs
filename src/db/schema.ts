import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table for authentication and user management
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  passwordHash: text('password_hash'), // Hashed password, nullable for OAuth users
  role: text('role').notNull().default('viewer'), // 'admin', 'editor', 'author', 'viewer'
  avatar: text('avatar'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  lastLoginAt: integer('last_login_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Content collections - dynamic schema definitions
export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  schema: text('schema', { mode: 'json' }).notNull(), // JSON schema definition
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Content items - actual content data
export const content = sqliteTable('content', {
  id: text('id').primaryKey(),
  collectionId: text('collection_id').notNull().references(() => collections.id),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  data: text('data', { mode: 'json' }).notNull(), // JSON content data
  status: text('status').notNull().default('draft'), // 'draft', 'published', 'archived'
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  authorId: text('author_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Content versions for versioning system
export const contentVersions = sqliteTable('content_versions', {
  id: text('id').primaryKey(),
  contentId: text('content_id').notNull().references(() => content.id),
  version: integer('version').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Media/Files table
export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  folder: text('folder').notNull().default('uploads'),
  r2Key: text('r2_key').notNull(), // R2 storage key
  publicUrl: text('public_url').notNull(), // CDN URL
  thumbnailUrl: text('thumbnail_url'),
  alt: text('alt'),
  caption: text('caption'),
  tags: text('tags', { mode: 'json' }), // JSON array of tags
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  uploadedAt: integer('uploaded_at').notNull(),
  updatedAt: integer('updated_at'),
  publishedAt: integer('published_at'),
  scheduledAt: integer('scheduled_at'),
  archivedAt: integer('archived_at'),
  deletedAt: integer('deleted_at'),
});

// API tokens for programmatic access
export const apiTokens = sqliteTable('api_tokens', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  token: text('token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id),
  permissions: text('permissions', { mode: 'json' }).notNull(), // Array of permissions
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

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

// Workflow history for content workflow tracking
export const workflowHistory = sqliteTable('workflow_history', {
  id: text('id').primaryKey(),
  contentId: text('content_id').notNull().references(() => content.id),
  action: text('action').notNull(),
  fromStatus: text('from_status').notNull(),
  toStatus: text('to_status').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Plugin system tables
export const plugins = sqliteTable('plugins', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  version: text('version').notNull(),
  author: text('author').notNull(),
  category: text('category').notNull(),
  icon: text('icon'),
  status: text('status').notNull().default('inactive'), // 'active', 'inactive', 'error'
  isCore: integer('is_core', { mode: 'boolean' }).notNull().default(false),
  settings: text('settings', { mode: 'json' }),
  permissions: text('permissions', { mode: 'json' }),
  dependencies: text('dependencies', { mode: 'json' }),
  downloadCount: integer('download_count').notNull().default(0),
  rating: integer('rating').notNull().default(0),
  installedAt: integer('installed_at').notNull(),
  activatedAt: integer('activated_at'),
  lastUpdated: integer('last_updated').notNull(),
  errorMessage: text('error_message'),
  createdAt: integer('created_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const pluginHooks = sqliteTable('plugin_hooks', {
  id: text('id').primaryKey(),
  pluginId: text('plugin_id').notNull().references(() => plugins.id),
  hookName: text('hook_name').notNull(),
  handlerName: text('handler_name').notNull(),
  priority: integer('priority').notNull().default(10),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const pluginRoutes = sqliteTable('plugin_routes', {
  id: text('id').primaryKey(),
  pluginId: text('plugin_id').notNull().references(() => plugins.id),
  path: text('path').notNull(),
  method: text('method').notNull(),
  handlerName: text('handler_name').notNull(),
  middleware: text('middleware', { mode: 'json' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const pluginAssets = sqliteTable('plugin_assets', {
  id: text('id').primaryKey(),
  pluginId: text('plugin_id').notNull().references(() => plugins.id),
  assetType: text('asset_type').notNull(), // 'css', 'js', 'image', 'font'
  assetPath: text('asset_path').notNull(),
  loadOrder: integer('load_order').notNull().default(100),
  loadLocation: text('load_location').notNull().default('footer'), // 'header', 'footer'
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const pluginActivityLog = sqliteTable('plugin_activity_log', {
  id: text('id').primaryKey(),
  pluginId: text('plugin_id').notNull().references(() => plugins.id),
  action: text('action').notNull(),
  userId: text('user_id'),
  details: text('details', { mode: 'json' }),
  timestamp: integer('timestamp').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email(),
  firstName: (schema) => schema.min(1),
  lastName: (schema) => schema.min(1),
  username: (schema) => schema.min(3),
});

export const selectUserSchema = createSelectSchema(users);

export const insertCollectionSchema = createInsertSchema(collections, {
  name: (schema) => schema.min(1).regex(/^[a-z0-9_]+$/, 'Collection name must be lowercase with underscores'),
  displayName: (schema) => schema.min(1),
});

export const selectCollectionSchema = createSelectSchema(collections);

export const insertContentSchema = createInsertSchema(content, {
  slug: (schema) => schema.min(1).regex(/^[a-zA-Z0-9_-]+$/, 'Slug must contain only letters, numbers, underscores, and hyphens'),
  title: (schema) => schema.min(1),
  status: (schema) => schema,
});

export const selectContentSchema = createSelectSchema(content);

export const insertMediaSchema = createInsertSchema(media, {
  filename: (schema) => schema.min(1),
  originalName: (schema) => schema.min(1),
  mimeType: (schema) => schema.min(1),
  size: (schema) => schema.positive(),
  r2Key: (schema) => schema.min(1),
  publicUrl: (schema) => schema.url(),
  folder: (schema) => schema.min(1),
});

export const selectMediaSchema = createSelectSchema(media);

export const insertEmailThemeSchema = createInsertSchema(emailThemes, {
  name: (schema) => schema.min(1),
  htmlTemplate: (schema) => schema.min(1),
  cssStyles: (schema) => schema.min(1),
});

export const selectEmailThemeSchema = createSelectSchema(emailThemes);

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates, {
  name: (schema) => schema.min(1),
  slug: (schema) => schema.min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes'),
  subject: (schema) => schema.min(1),
  markdownContent: (schema) => schema.min(1),
});

export const selectEmailTemplateSchema = createSelectSchema(emailTemplates);

export const insertEmailLogSchema = createInsertSchema(emailLogs, {
  recipientEmail: (schema) => schema.email(),
  subject: (schema) => schema.min(1),
  status: (schema) => schema,
});

export const selectEmailLogSchema = createSelectSchema(emailLogs);

export const insertEmailVariableSchema = createInsertSchema(emailVariables, {
  name: (schema) => schema.min(1).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Variable name must be valid identifier'),
  displayName: (schema) => schema.min(1),
  dataType: (schema) => schema,
});

export const selectEmailVariableSchema = createSelectSchema(emailVariables);

export const insertWorkflowHistorySchema = createInsertSchema(workflowHistory, {
  action: (schema) => schema.min(1),
  fromStatus: (schema) => schema.min(1),
  toStatus: (schema) => schema.min(1),
});

export const selectWorkflowHistorySchema = createSelectSchema(workflowHistory);

export const insertPluginSchema = createInsertSchema(plugins, {
  name: (schema) => schema.min(1),
  displayName: (schema) => schema.min(1),
  version: (schema) => schema.min(1),
  author: (schema) => schema.min(1),
  category: (schema) => schema.min(1),
});

export const selectPluginSchema = createSelectSchema(plugins);

export const insertPluginHookSchema = createInsertSchema(pluginHooks, {
  hookName: (schema) => schema.min(1),
  handlerName: (schema) => schema.min(1),
});

export const selectPluginHookSchema = createSelectSchema(pluginHooks);

export const insertPluginRouteSchema = createInsertSchema(pluginRoutes, {
  path: (schema) => schema.min(1),
  method: (schema) => schema.min(1),
  handlerName: (schema) => schema.min(1),
});

export const selectPluginRouteSchema = createSelectSchema(pluginRoutes);

export const insertPluginAssetSchema = createInsertSchema(pluginAssets, {
  assetType: (schema) => schema.min(1),
  assetPath: (schema) => schema.min(1),
});

export const selectPluginAssetSchema = createSelectSchema(pluginAssets);

export const insertPluginActivityLogSchema = createInsertSchema(pluginActivityLog, {
  action: (schema) => schema.min(1),
});

export const selectPluginActivityLogSchema = createSelectSchema(pluginActivityLog);

// System logs table for comprehensive logging
export const systemLogs = sqliteTable('system_logs', {
  id: text('id').primaryKey(),
  level: text('level').notNull(), // 'debug', 'info', 'warn', 'error', 'fatal'
  category: text('category').notNull(), // 'auth', 'api', 'workflow', 'plugin', 'media', 'system', etc.
  message: text('message').notNull(),
  data: text('data', { mode: 'json' }), // Additional structured data
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id'),
  requestId: text('request_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  method: text('method'), // HTTP method for API logs
  url: text('url'), // Request URL for API logs
  statusCode: integer('status_code'), // HTTP status code for API logs
  duration: integer('duration'), // Request duration in milliseconds
  stackTrace: text('stack_trace'), // Error stack trace for error logs
  tags: text('tags', { mode: 'json' }), // Array of tags for categorization
  source: text('source'), // Source component/module that generated the log
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Log configuration table
export const logConfig = sqliteTable('log_config', {
  id: text('id').primaryKey(),
  category: text('category').notNull().unique(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  level: text('level').notNull().default('info'), // minimum log level to store
  retention: integer('retention').notNull().default(30), // days to keep logs
  maxSize: integer('max_size').default(10000), // max number of logs per category
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Insert and select schemas for system logs
export const insertSystemLogSchema = createInsertSchema(systemLogs, {
  level: (schema) => schema.min(1),
  category: (schema) => schema.min(1),
  message: (schema) => schema.min(1),
});

export const selectSystemLogSchema = createSelectSchema(systemLogs);

export const insertLogConfigSchema = createInsertSchema(logConfig, {
  category: (schema) => schema.min(1),
  level: (schema) => schema.min(1),
});

export const selectLogConfigSchema = createSelectSchema(logConfig);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type EmailTheme = typeof emailThemes.$inferSelect;
export type NewEmailTheme = typeof emailThemes.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;
export type EmailLog = typeof emailLogs.$inferSelect;
export type NewEmailLog = typeof emailLogs.$inferInsert;
export type EmailVariable = typeof emailVariables.$inferSelect;
export type NewEmailVariable = typeof emailVariables.$inferInsert;
export type WorkflowHistory = typeof workflowHistory.$inferSelect;
export type NewWorkflowHistory = typeof workflowHistory.$inferInsert;
export type Plugin = typeof plugins.$inferSelect;
export type NewPlugin = typeof plugins.$inferInsert;
export type PluginHook = typeof pluginHooks.$inferSelect;
export type NewPluginHook = typeof pluginHooks.$inferInsert;
export type PluginRoute = typeof pluginRoutes.$inferSelect;
export type NewPluginRoute = typeof pluginRoutes.$inferInsert;
export type PluginAsset = typeof pluginAssets.$inferSelect;
export type NewPluginAsset = typeof pluginAssets.$inferInsert;
export type PluginActivityLog = typeof pluginActivityLog.$inferSelect;
export type NewPluginActivityLog = typeof pluginActivityLog.$inferInsert;
export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;
export type LogConfig = typeof logConfig.$inferSelect;
export type NewLogConfig = typeof logConfig.$inferInsert;