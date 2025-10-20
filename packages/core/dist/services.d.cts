export { C as CorePlugin, n as LogCategory, o as LogEntry, p as LogFilter, m as LogLevel, L as Logger, e as Migration, M as MigrationService, h as MigrationStatus, q as PluginBootstrapService, P as PluginService, d as cleanupRemovedCollections, f as fullCollectionSync, g as getAvailableCollectionNames, j as getLogger, c as getManagedCollections, k as initLogger, i as isCollectionManaged, a as loadCollectionConfig, l as loadCollectionConfigs, b as syncCollection, s as syncCollections, v as validateCollectionConfig } from './plugin-bootstrap-BpyWuT1_.cjs';
import './collection-config-FLlGtsh9.cjs';
import '@cloudflare/workers-types';
import 'drizzle-zod';
import 'drizzle-orm/sqlite-core';

/**
 * Simple Cache Service
 *
 * Provides basic caching functionality for the core package
 * Can be extended with KV or other storage backends
 */
interface CacheConfig {
    ttl: number;
    keyPrefix: string;
}
declare class CacheService {
    private config;
    private memoryCache;
    constructor(config: CacheConfig);
    /**
     * Generate cache key with prefix
     */
    generateKey(type: string, identifier?: string): string;
    /**
     * Get value from cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Get value from cache with source information
     */
    getWithSource<T>(key: string): Promise<{
        hit: boolean;
        data: T | null;
        source: string;
        ttl?: number;
    }>;
    /**
     * Set value in cache
     */
    set(key: string, value: any, ttl?: number): Promise<void>;
    /**
     * Delete specific key from cache
     */
    delete(key: string): Promise<void>;
    /**
     * Invalidate cache keys matching a pattern
     * For memory cache, we do simple string matching
     */
    invalidate(pattern: string): Promise<void>;
    /**
     * Clear all cache
     */
    clear(): Promise<void>;
}
/**
 * Cache configurations for different data types
 */
declare const CACHE_CONFIGS: {
    api: {
        ttl: number;
        keyPrefix: string;
    };
    user: {
        ttl: number;
        keyPrefix: string;
    };
    content: {
        ttl: number;
        keyPrefix: string;
    };
    collection: {
        ttl: number;
        keyPrefix: string;
    };
};
/**
 * Get cache service instance for a config
 */
declare function getCacheService(config: CacheConfig): CacheService;

export { CACHE_CONFIGS, type CacheConfig, CacheService, getCacheService };
