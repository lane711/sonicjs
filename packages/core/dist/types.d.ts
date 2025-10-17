export { b as CollectionConfig, c as CollectionConfigModule, C as CollectionSchema, d as CollectionSyncResult, a as FieldConfig, F as FieldType } from './collection-config-FLlGtsh9.js';
export { A as AuthService, C as ContentService, u as HOOKS, k as HookContext, H as HookHandler, t as HookName, l as HookSystem, M as MediaService, v as ModelRelationship, P as Plugin, g as PluginAdminPage, q as PluginBuilderOptions, h as PluginComponent, b as PluginConfig, a as PluginContext, j as PluginHook, p as PluginLogger, n as PluginManager, i as PluginMenuItem, d as PluginMiddleware, e as PluginModel, m as PluginRegistry, c as PluginRoutes, f as PluginService, o as PluginStatus, s as PluginValidationResult, r as PluginValidator, S as ScopedHookSystem } from './plugin-UzmDImQc.js';
import 'hono';
import 'zod';
import '@cloudflare/workers-types';

/**
 * Plugin Manifest Types
 *
 * Defines the structure for plugin manifest.json files
 */
interface PluginManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    homepage?: string;
    repository?: string;
    license?: string;
    category: string;
    tags?: string[];
    dependencies?: string[];
    settings?: Record<string, any>;
    hooks?: Record<string, string>;
    routes?: Array<{
        path: string;
        method: string;
        handler: string;
        description?: string;
    }>;
    permissions?: Record<string, string>;
    adminMenu?: {
        label: string;
        icon: string;
        path: string;
        order: number;
    };
}

export type { PluginManifest };
