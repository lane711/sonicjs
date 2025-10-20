'use strict';

var chunkK6ZR653V_cjs = require('./chunk-K6ZR653V.cjs');
var chunk24PWAFUT_cjs = require('./chunk-24PWAFUT.cjs');
var chunkRGCQSFKC_cjs = require('./chunk-RGCQSFKC.cjs');
var hono = require('hono');
var cors = require('hono/cors');

// src/schemas/index.ts
var schemaDefinitions = [];
var apiContentCrudRoutes = new hono.Hono();
apiContentCrudRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const stmt = db.prepare("SELECT * FROM content WHERE id = ?");
    const content = await stmt.bind(id).first();
    if (!content) {
      return c.json({ error: "Content not found" }, 404);
    }
    const transformedContent = {
      id: content.id,
      title: content.title,
      slug: content.slug,
      status: content.status,
      collectionId: content.collection_id,
      data: content.data ? JSON.parse(content.data) : {},
      created_at: content.created_at,
      updated_at: content.updated_at
    };
    return c.json({ data: transformedContent });
  } catch (error) {
    console.error("Error fetching content:", error);
    return c.json({
      error: "Failed to fetch content",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});
apiContentCrudRoutes.post("/", chunk24PWAFUT_cjs.requireAuth(), async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const body = await c.req.json();
    const { collectionId, title, slug, status, data } = body;
    if (!collectionId) {
      return c.json({ error: "collectionId is required" }, 400);
    }
    if (!title) {
      return c.json({ error: "title is required" }, 400);
    }
    let finalSlug = slug || title;
    finalSlug = finalSlug.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
    const duplicateCheck = db.prepare(
      "SELECT id FROM content WHERE collection_id = ? AND slug = ?"
    );
    const existing = await duplicateCheck.bind(collectionId, finalSlug).first();
    if (existing) {
      return c.json({ error: "A content item with this slug already exists in this collection" }, 409);
    }
    const contentId = crypto.randomUUID();
    const now = Date.now();
    const insertStmt = db.prepare(`
      INSERT INTO content (
        id, collection_id, slug, title, data, status,
        author_id, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await insertStmt.bind(
      contentId,
      collectionId,
      finalSlug,
      title,
      JSON.stringify(data || {}),
      status || "draft",
      user?.userId || "unknown",
      now,
      now
    ).run();
    const cache = chunkK6ZR653V_cjs.getCacheService(chunkK6ZR653V_cjs.CACHE_CONFIGS.api);
    await cache.invalidate(`content:list:${collectionId}:*`);
    await cache.invalidate("content-filtered:*");
    const getStmt = db.prepare("SELECT * FROM content WHERE id = ?");
    const createdContent = await getStmt.bind(contentId).first();
    return c.json({
      data: {
        id: createdContent.id,
        title: createdContent.title,
        slug: createdContent.slug,
        status: createdContent.status,
        collectionId: createdContent.collection_id,
        data: createdContent.data ? JSON.parse(createdContent.data) : {},
        created_at: createdContent.created_at,
        updated_at: createdContent.updated_at
      }
    }, 201);
  } catch (error) {
    console.error("Error creating content:", error);
    return c.json({
      error: "Failed to create content",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});
apiContentCrudRoutes.put("/:id", chunk24PWAFUT_cjs.requireAuth(), async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const body = await c.req.json();
    const existingStmt = db.prepare("SELECT * FROM content WHERE id = ?");
    const existing = await existingStmt.bind(id).first();
    if (!existing) {
      return c.json({ error: "Content not found" }, 404);
    }
    const updates = [];
    const params = [];
    if (body.title !== void 0) {
      updates.push("title = ?");
      params.push(body.title);
    }
    if (body.slug !== void 0) {
      let finalSlug = body.slug.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
      updates.push("slug = ?");
      params.push(finalSlug);
    }
    if (body.status !== void 0) {
      updates.push("status = ?");
      params.push(body.status);
    }
    if (body.data !== void 0) {
      updates.push("data = ?");
      params.push(JSON.stringify(body.data));
    }
    const now = Date.now();
    updates.push("updated_at = ?");
    params.push(now);
    params.push(id);
    const updateStmt = db.prepare(`
      UPDATE content SET ${updates.join(", ")}
      WHERE id = ?
    `);
    await updateStmt.bind(...params).run();
    const cache = chunkK6ZR653V_cjs.getCacheService(chunkK6ZR653V_cjs.CACHE_CONFIGS.api);
    await cache.delete(cache.generateKey("content", id));
    await cache.invalidate(`content:list:${existing.collection_id}:*`);
    await cache.invalidate("content-filtered:*");
    const getStmt = db.prepare("SELECT * FROM content WHERE id = ?");
    const updatedContent = await getStmt.bind(id).first();
    return c.json({
      data: {
        id: updatedContent.id,
        title: updatedContent.title,
        slug: updatedContent.slug,
        status: updatedContent.status,
        collectionId: updatedContent.collection_id,
        data: updatedContent.data ? JSON.parse(updatedContent.data) : {},
        created_at: updatedContent.created_at,
        updated_at: updatedContent.updated_at
      }
    });
  } catch (error) {
    console.error("Error updating content:", error);
    return c.json({
      error: "Failed to update content",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});
apiContentCrudRoutes.delete("/:id", chunk24PWAFUT_cjs.requireAuth(), async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const existingStmt = db.prepare("SELECT collection_id FROM content WHERE id = ?");
    const existing = await existingStmt.bind(id).first();
    if (!existing) {
      return c.json({ error: "Content not found" }, 404);
    }
    const deleteStmt = db.prepare("DELETE FROM content WHERE id = ?");
    await deleteStmt.bind(id).run();
    const cache = chunkK6ZR653V_cjs.getCacheService(chunkK6ZR653V_cjs.CACHE_CONFIGS.api);
    await cache.delete(cache.generateKey("content", id));
    await cache.invalidate(`content:list:${existing.collection_id}:*`);
    await cache.invalidate("content-filtered:*");
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting content:", error);
    return c.json({
      error: "Failed to delete content",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});
var api_content_crud_default = apiContentCrudRoutes;

// src/routes/api.ts
var apiRoutes = new hono.Hono();
apiRoutes.use("*", async (c, next) => {
  const startTime = Date.now();
  c.set("startTime", startTime);
  await next();
  const totalTime = Date.now() - startTime;
  c.header("X-Response-Time", `${totalTime}ms`);
});
apiRoutes.use("*", async (c, next) => {
  const cacheEnabled = await chunk24PWAFUT_cjs.isPluginActive(c.env.DB, "core-cache");
  c.set("cacheEnabled", cacheEnabled);
  await next();
});
apiRoutes.use("*", cors.cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"]
}));
function addTimingMeta(c, meta = {}, executionStartTime) {
  const totalTime = Date.now() - c.get("startTime");
  const executionTime = executionStartTime ? Date.now() - executionStartTime : void 0;
  return {
    ...meta,
    timing: {
      total: totalTime,
      execution: executionTime,
      unit: "ms"
    }
  };
}
apiRoutes.get("/", (c) => {
  return c.json({
    name: "SonicJS API",
    version: "2.0.0",
    description: "RESTful API for SonicJS headless CMS",
    endpoints: {
      health: "/api/health",
      collections: "/api/collections",
      content: "/api/content",
      contentById: "/api/content/:id",
      collectionContent: "/api/collections/:collection/content"
    },
    documentation: "/docs"
  });
});
apiRoutes.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    schemas: schemaDefinitions.map((s) => s.name)
  });
});
apiRoutes.get("/collections", async (c) => {
  const executionStart = Date.now();
  try {
    const db = c.env.DB;
    const cacheEnabled = c.get("cacheEnabled");
    const cache = chunkK6ZR653V_cjs.getCacheService(chunkK6ZR653V_cjs.CACHE_CONFIGS.api);
    const cacheKey = cache.generateKey("collections", "all");
    if (cacheEnabled) {
      const cacheResult = await cache.getWithSource(cacheKey);
      if (cacheResult.hit && cacheResult.data) {
        c.header("X-Cache-Status", "HIT");
        c.header("X-Cache-Source", cacheResult.source);
        if (cacheResult.ttl) {
          c.header("X-Cache-TTL", Math.floor(cacheResult.ttl).toString());
        }
        const dataWithMeta = {
          ...cacheResult.data,
          meta: addTimingMeta(c, {
            ...cacheResult.data.meta,
            cache: {
              hit: true,
              source: cacheResult.source,
              ttl: cacheResult.ttl ? Math.floor(cacheResult.ttl) : void 0
            }
          }, executionStart)
        };
        return c.json(dataWithMeta);
      }
    }
    c.header("X-Cache-Status", "MISS");
    c.header("X-Cache-Source", "database");
    const stmt = db.prepare("SELECT * FROM collections WHERE is_active = 1");
    const { results } = await stmt.all();
    const transformedResults = results.map((row) => ({
      ...row,
      schema: row.schema ? JSON.parse(row.schema) : {},
      is_active: row.is_active
      // Keep as number (1 or 0)
    }));
    const responseData = {
      data: transformedResults,
      meta: addTimingMeta(c, {
        count: results.length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        cache: {
          hit: false,
          source: "database"
        }
      }, executionStart)
    };
    if (cacheEnabled) {
      await cache.set(cacheKey, responseData);
    }
    return c.json(responseData);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return c.json({ error: "Failed to fetch collections" }, 500);
  }
});
apiRoutes.get("/content", async (c) => {
  const executionStart = Date.now();
  try {
    const db = c.env.DB;
    const queryParams = c.req.query();
    if (queryParams.collection) {
      const collectionName = queryParams.collection;
      const collectionStmt = db.prepare("SELECT id FROM collections WHERE name = ? AND is_active = 1");
      const collectionResult = await collectionStmt.bind(collectionName).first();
      if (collectionResult) {
        queryParams.collection_id = collectionResult.id;
        delete queryParams.collection;
      } else {
        return c.json({
          data: [],
          meta: addTimingMeta(c, {
            count: 0,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            message: `Collection '${collectionName}' not found`
          }, executionStart)
        });
      }
    }
    const filter = chunkRGCQSFKC_cjs.QueryFilterBuilder.parseFromQuery(queryParams);
    if (!filter.limit) {
      filter.limit = 50;
    }
    filter.limit = Math.min(filter.limit, 1e3);
    const builder = new chunkRGCQSFKC_cjs.QueryFilterBuilder();
    const queryResult = builder.build("content", filter);
    if (queryResult.errors.length > 0) {
      return c.json({
        error: "Invalid filter parameters",
        details: queryResult.errors
      }, 400);
    }
    const cacheEnabled = c.get("cacheEnabled");
    const cache = chunkK6ZR653V_cjs.getCacheService(chunkK6ZR653V_cjs.CACHE_CONFIGS.api);
    const cacheKey = cache.generateKey("content-filtered", JSON.stringify({ filter, query: queryResult.sql }));
    if (cacheEnabled) {
      const cacheResult = await cache.getWithSource(cacheKey);
      if (cacheResult.hit && cacheResult.data) {
        c.header("X-Cache-Status", "HIT");
        c.header("X-Cache-Source", cacheResult.source);
        if (cacheResult.ttl) {
          c.header("X-Cache-TTL", Math.floor(cacheResult.ttl).toString());
        }
        const dataWithMeta = {
          ...cacheResult.data,
          meta: addTimingMeta(c, {
            ...cacheResult.data.meta,
            cache: {
              hit: true,
              source: cacheResult.source,
              ttl: cacheResult.ttl ? Math.floor(cacheResult.ttl) : void 0
            }
          }, executionStart)
        };
        return c.json(dataWithMeta);
      }
    }
    c.header("X-Cache-Status", "MISS");
    c.header("X-Cache-Source", "database");
    const stmt = db.prepare(queryResult.sql);
    const boundStmt = queryResult.params.length > 0 ? stmt.bind(...queryResult.params) : stmt;
    const { results } = await boundStmt.all();
    const transformedResults = results.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      collectionId: row.collection_id,
      data: row.data ? JSON.parse(row.data) : {},
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    const responseData = {
      data: transformedResults,
      meta: addTimingMeta(c, {
        count: results.length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        filter,
        query: {
          sql: queryResult.sql,
          params: queryResult.params
        },
        cache: {
          hit: false,
          source: "database"
        }
      }, executionStart)
    };
    if (cacheEnabled) {
      await cache.set(cacheKey, responseData);
    }
    return c.json(responseData);
  } catch (error) {
    console.error("Error fetching content:", error);
    return c.json({
      error: "Failed to fetch content",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});
apiRoutes.get("/collections/:collection/content", async (c) => {
  const executionStart = Date.now();
  try {
    const collection = c.req.param("collection");
    const db = c.env.DB;
    const queryParams = c.req.query();
    const collectionStmt = db.prepare("SELECT * FROM collections WHERE name = ? AND is_active = 1");
    const collectionResult = await collectionStmt.bind(collection).first();
    if (!collectionResult) {
      return c.json({ error: "Collection not found" }, 404);
    }
    const filter = chunkRGCQSFKC_cjs.QueryFilterBuilder.parseFromQuery(queryParams);
    if (!filter.where) {
      filter.where = { and: [] };
    }
    if (!filter.where.and) {
      filter.where.and = [];
    }
    filter.where.and.push({
      field: "collection_id",
      operator: "equals",
      value: collectionResult.id
    });
    if (!filter.limit) {
      filter.limit = 50;
    }
    filter.limit = Math.min(filter.limit, 1e3);
    const builder = new chunkRGCQSFKC_cjs.QueryFilterBuilder();
    const queryResult = builder.build("content", filter);
    if (queryResult.errors.length > 0) {
      return c.json({
        error: "Invalid filter parameters",
        details: queryResult.errors
      }, 400);
    }
    const cacheEnabled = c.get("cacheEnabled");
    const cache = chunkK6ZR653V_cjs.getCacheService(chunkK6ZR653V_cjs.CACHE_CONFIGS.api);
    const cacheKey = cache.generateKey("collection-content-filtered", `${collection}:${JSON.stringify({ filter, query: queryResult.sql })}`);
    if (cacheEnabled) {
      const cacheResult = await cache.getWithSource(cacheKey);
      if (cacheResult.hit && cacheResult.data) {
        c.header("X-Cache-Status", "HIT");
        c.header("X-Cache-Source", cacheResult.source);
        if (cacheResult.ttl) {
          c.header("X-Cache-TTL", Math.floor(cacheResult.ttl).toString());
        }
        const dataWithMeta = {
          ...cacheResult.data,
          meta: addTimingMeta(c, {
            ...cacheResult.data.meta,
            cache: {
              hit: true,
              source: cacheResult.source,
              ttl: cacheResult.ttl ? Math.floor(cacheResult.ttl) : void 0
            }
          }, executionStart)
        };
        return c.json(dataWithMeta);
      }
    }
    c.header("X-Cache-Status", "MISS");
    c.header("X-Cache-Source", "database");
    const stmt = db.prepare(queryResult.sql);
    const boundStmt = queryResult.params.length > 0 ? stmt.bind(...queryResult.params) : stmt;
    const { results } = await boundStmt.all();
    const transformedResults = results.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      collectionId: row.collection_id,
      data: row.data ? JSON.parse(row.data) : {},
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    const responseData = {
      data: transformedResults,
      meta: addTimingMeta(c, {
        collection: {
          ...collectionResult,
          schema: collectionResult.schema ? JSON.parse(collectionResult.schema) : {}
        },
        count: results.length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        filter,
        query: {
          sql: queryResult.sql,
          params: queryResult.params
        },
        cache: {
          hit: false,
          source: "database"
        }
      }, executionStart)
    };
    if (cacheEnabled) {
      await cache.set(cacheKey, responseData);
    }
    return c.json(responseData);
  } catch (error) {
    console.error("Error fetching content:", error);
    return c.json({
      error: "Failed to fetch content",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});
apiRoutes.route("/content", api_content_crud_default);
var api_default = apiRoutes;

// src/routes/index.ts
var ROUTES_INFO = {
  message: "Routes migration in progress",
  available: [
    "apiRoutes",
    "apiContentCrudRoutes"
  ],
  status: "Routes are being added incrementally",
  reference: "https://github.com/sonicjs/sonicjs"
};

exports.ROUTES_INFO = ROUTES_INFO;
exports.api_content_crud_default = api_content_crud_default;
exports.api_default = api_default;
//# sourceMappingURL=chunk-YF6OCX54.cjs.map
//# sourceMappingURL=chunk-YF6OCX54.cjs.map