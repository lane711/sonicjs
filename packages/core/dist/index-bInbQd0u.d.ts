import * as hono_types from 'hono/types';
import { Hono, Context } from 'hono';
import { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

/**
 * Main Application Factory
 *
 * Creates a configured SonicJS application with all core functionality
 */

interface Bindings {
    DB: D1Database;
    CACHE_KV: KVNamespace;
    MEDIA_BUCKET: R2Bucket;
    ASSETS: Fetcher;
    EMAIL_QUEUE?: Queue;
    SENDGRID_API_KEY?: string;
    DEFAULT_FROM_EMAIL?: string;
    IMAGES_ACCOUNT_ID?: string;
    IMAGES_API_TOKEN?: string;
    ENVIRONMENT?: string;
}
interface Variables$1 {
    user?: {
        userId: string;
        email: string;
        role: string;
        exp: number;
        iat: number;
    };
    requestId?: string;
    startTime?: number;
    appVersion?: string;
}
interface SonicJSConfig {
    collections?: {
        directory?: string;
        autoSync?: boolean;
    };
    plugins?: {
        directory?: string;
        autoLoad?: boolean;
    };
    routes?: Array<{
        path: string;
        handler: Hono;
    }>;
    middleware?: {
        beforeAuth?: Array<(c: Context, next: () => Promise<void>) => Promise<void>>;
        afterAuth?: Array<(c: Context, next: () => Promise<void>) => Promise<void>>;
    };
    version?: string;
    name?: string;
}
type SonicJSApp = Hono<{
    Bindings: Bindings;
    Variables: Variables$1;
}>;
/**
 * Create a SonicJS application with core functionality
 *
 * @param config - Application configuration
 * @returns Configured Hono application
 *
 * @example
 * ```typescript
 * import { createSonicJSApp } from '@sonicjs/core'
 *
 * const app = createSonicJSApp({
 *   collections: {
 *     directory: './src/collections',
 *     autoSync: true
 *   },
 *   plugins: {
 *     directory: './src/plugins',
 *     autoLoad: true
 *   }
 * })
 *
 * export default app
 * ```
 */
declare function createSonicJSApp(config?: SonicJSConfig): SonicJSApp;
/**
 * Setup core middleware (backward compatibility)
 *
 * @param _app - Hono application
 * @deprecated Use createSonicJSApp() instead
 */
declare function setupCoreMiddleware(_app: SonicJSApp): void;
/**
 * Setup core routes (backward compatibility)
 *
 * @param _app - Hono application
 * @deprecated Use createSonicJSApp() instead
 */
declare function setupCoreRoutes(_app: SonicJSApp): void;

interface Variables extends Variables$1 {
    startTime: number;
    cacheEnabled?: boolean;
}
declare const apiRoutes: Hono<{
    Bindings: Bindings;
    Variables: Variables;
}, hono_types.BlankSchema, "/">;

declare const apiContentCrudRoutes: Hono<{
    Bindings: Bindings;
    Variables: Variables$1;
}, hono_types.BlankSchema, "/">;

/**
 * Routes Module Exports
 *
 * Routes are being migrated incrementally from the monolith.
 * Each route is refactored to remove monolith-specific dependencies.
 */

declare const ROUTES_INFO: {
    readonly message: "Routes migration in progress";
    readonly available: readonly ["apiRoutes", "apiContentCrudRoutes"];
    readonly status: "Routes are being added incrementally";
    readonly reference: "https://github.com/sonicjs/sonicjs";
};

export { type Bindings as B, ROUTES_INFO as R, type SonicJSConfig as S, type Variables$1 as V, setupCoreRoutes as a, type SonicJSApp as b, createSonicJSApp as c, apiRoutes as d, apiContentCrudRoutes as e, setupCoreMiddleware as s };
