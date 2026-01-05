import * as hono_types from 'hono/types';
import { Hono } from 'hono';
import { B as Bindings$7, V as Variables$8 } from './app-Db0AfT5F.js';
import { D1Database as D1Database$1, KVNamespace as KVNamespace$1, R2Bucket as R2Bucket$1 } from '@cloudflare/workers-types';

interface Variables$7 extends Variables$8 {
    startTime: number;
    cacheEnabled?: boolean;
}
declare const apiRoutes: Hono<{
    Bindings: Bindings$7;
    Variables: Variables$7;
}, hono_types.BlankSchema, "/">;

declare const apiContentCrudRoutes: Hono<{
    Bindings: Bindings$7;
    Variables: Variables$8;
}, hono_types.BlankSchema, "/">;

declare const apiMediaRoutes: Hono<{
    Bindings: Bindings$7;
    Variables: Variables$8;
}, hono_types.BlankSchema, "/">;

declare const apiSystemRoutes: Hono<{
    Bindings: Bindings$7;
    Variables: Variables$8;
}, hono_types.BlankSchema, "/">;

declare const adminApiRoutes: Hono<{
    Bindings: Bindings$7;
    Variables: Variables$8;
}, hono_types.BlankSchema, "/">;

declare const authRoutes: Hono<{
    Bindings: Bindings$7;
    Variables: Variables$8;
}, hono_types.BlankSchema, "/">;

declare const app: Hono<hono_types.BlankEnv, hono_types.BlankSchema, "/">;

declare const adminContentRoutes: Hono<{
    Bindings: Bindings$7;
    Variables: Variables$8;
}, hono_types.BlankSchema, "/">;

declare const userRoutes: Hono<{
    Bindings: Bindings$7;
    Variables: Variables$8;
}, hono_types.BlankSchema, "/">;

declare const adminMediaRoutes: Hono<{
    Bindings: Bindings$7;
    Variables: Variables$8;
}, hono_types.BlankSchema, "/">;

declare const adminPluginRoutes: Hono<{
    Bindings: Bindings$7;
    Variables: Variables$8;
}, hono_types.BlankSchema, "/">;

declare const adminLogsRoutes: Hono<{
    Bindings: Bindings$7;
    Variables: Variables$8;
}, hono_types.BlankSchema, "/">;

type Bindings$6 = {
    DB: D1Database;
    KV: KVNamespace;
};
type Variables$6 = {
    user: {
        userId: string;
        email: string;
        role: string;
    };
};
declare const adminDesignRoutes: Hono<{
    Bindings: Bindings$6;
    Variables: Variables$6;
}, hono_types.BlankSchema, "/">;

type Bindings$5 = {
    DB: D1Database;
    KV: KVNamespace;
};
type Variables$5 = {
    user: {
        userId: string;
        email: string;
        role: string;
    };
};
declare const adminCheckboxRoutes: Hono<{
    Bindings: Bindings$5;
    Variables: Variables$5;
}, hono_types.BlankSchema, "/">;

type Bindings$4 = {
    DB: D1Database;
    KV: KVNamespace;
};
type Variables$4 = {
    user?: {
        userId: string;
        email: string;
        role: string;
        exp: number;
        iat: number;
    };
};
declare const adminTestimonialsRoutes: Hono<{
    Bindings: Bindings$4;
    Variables: Variables$4;
}, hono_types.BlankSchema, "/">;

type Bindings$3 = {
    DB: D1Database;
    KV: KVNamespace;
};
type Variables$3 = {
    user?: {
        userId: string;
        email: string;
        role: string;
        exp: number;
        iat: number;
    };
};
declare const adminCodeExamplesRoutes: Hono<{
    Bindings: Bindings$3;
    Variables: Variables$3;
}, hono_types.BlankSchema, "/">;

type Bindings$2 = {
    DB: D1Database$1;
    CACHE_KV: KVNamespace$1;
    MEDIA_BUCKET: R2Bucket$1;
};
type Variables$2 = {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
};
declare const router: Hono<{
    Bindings: Bindings$2;
    Variables: Variables$2;
}, hono_types.BlankSchema, "/">;

type Bindings$1 = {
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
};
type Variables$1 = {
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
};
declare const adminCollectionsRoutes: Hono<{
    Bindings: Bindings$1;
    Variables: Variables$1;
}, hono_types.BlankSchema, "/">;

type Bindings = {
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
};
type Variables = {
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
};
declare const adminSettingsRoutes: Hono<{
    Bindings: Bindings;
    Variables: Variables;
}, hono_types.BlankSchema, "/">;

/**
 * Routes Module Exports
 *
 * Routes are being migrated incrementally from the monolith.
 * Each route is refactored to remove monolith-specific dependencies.
 */

declare const ROUTES_INFO: {
    readonly message: "Core routes available";
    readonly available: readonly ["apiRoutes", "apiContentCrudRoutes", "apiMediaRoutes", "apiSystemRoutes", "adminApiRoutes", "authRoutes", "testCleanupRoutes", "adminContentRoutes", "adminUsersRoutes", "adminMediaRoutes", "adminPluginRoutes", "adminLogsRoutes", "adminDesignRoutes", "adminCheckboxRoutes", "adminTestimonialsRoutes", "adminCodeExamplesRoutes", "adminDashboardRoutes", "adminCollectionsRoutes", "adminSettingsRoutes"];
    readonly status: "Core package routes ready";
    readonly reference: "https://github.com/sonicjs/sonicjs";
};

export { ROUTES_INFO, adminApiRoutes, adminCheckboxRoutes, adminCodeExamplesRoutes, adminCollectionsRoutes, adminContentRoutes, router as adminDashboardRoutes, adminDesignRoutes, adminLogsRoutes, adminMediaRoutes, adminPluginRoutes, adminSettingsRoutes, adminTestimonialsRoutes, userRoutes as adminUsersRoutes, apiContentCrudRoutes, apiMediaRoutes, apiRoutes, apiSystemRoutes, authRoutes, app as testCleanupRoutes };
