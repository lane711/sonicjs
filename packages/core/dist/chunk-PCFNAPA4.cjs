'use strict';

var chunkK6ZR653V_cjs = require('./chunk-K6ZR653V.cjs');
var chunk24PWAFUT_cjs = require('./chunk-24PWAFUT.cjs');
var chunkRGCQSFKC_cjs = require('./chunk-RGCQSFKC.cjs');
var hono = require('hono');
var cors = require('hono/cors');
var zod = require('zod');
var validator = require('hono/validator');
var cookie = require('hono/cookie');
var html = require('hono/html');

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
function generateId() {
  return crypto.randomUUID().replace(/-/g, "").substring(0, 21);
}
async function emitEvent(eventName, data) {
  console.log(`[Event] ${eventName}:`, data);
}
var fileValidationSchema = zod.z.object({
  name: zod.z.string().min(1).max(255),
  type: zod.z.string().refine(
    (type) => {
      const allowedTypes = [
        // Images
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        // Documents
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        // Videos
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/avi",
        "video/mov",
        // Audio
        "audio/mp3",
        "audio/wav",
        "audio/ogg",
        "audio/m4a"
      ];
      return allowedTypes.includes(type);
    },
    { message: "Unsupported file type" }
  ),
  size: zod.z.number().min(1).max(50 * 1024 * 1024)
  // 50MB max
});
var apiMediaRoutes = new hono.Hono();
apiMediaRoutes.use("*", chunk24PWAFUT_cjs.requireAuth());
apiMediaRoutes.post("/upload", async (c) => {
  try {
    const user = c.get("user");
    const formData = await c.req.formData();
    const file = formData.get("file");
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }
    const validation = fileValidationSchema.safeParse({
      name: file.name,
      type: file.type,
      size: file.size
    });
    if (!validation.success) {
      return c.json({
        error: "File validation failed",
        details: validation.error.issues
      }, 400);
    }
    const fileId = generateId();
    const fileExtension = file.name.split(".").pop() || "";
    const filename = `${fileId}.${fileExtension}`;
    const folder = formData.get("folder") || "uploads";
    const r2Key = `${folder}/${filename}`;
    const arrayBuffer = await file.arrayBuffer();
    const uploadResult = await c.env.MEDIA_BUCKET.put(r2Key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `inline; filename="${file.name}"`
      },
      customMetadata: {
        originalName: file.name,
        uploadedBy: user.userId,
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    if (!uploadResult) {
      return c.json({ error: "Failed to upload file to storage" }, 500);
    }
    const bucketName = c.env.BUCKET_NAME || "sonicjs-media-dev";
    const publicUrl = `https://pub-${bucketName}.r2.dev/${r2Key}`;
    let width;
    let height;
    if (file.type.startsWith("image/") && !file.type.includes("svg")) {
      try {
        const dimensions = await getImageDimensions(arrayBuffer);
        width = dimensions.width;
        height = dimensions.height;
      } catch (error) {
        console.warn("Failed to extract image dimensions:", error);
      }
    }
    let thumbnailUrl;
    if (file.type.startsWith("image/") && c.env.IMAGES_ACCOUNT_ID) {
      thumbnailUrl = `https://imagedelivery.net/${c.env.IMAGES_ACCOUNT_ID}/${r2Key}/thumbnail`;
    }
    const mediaRecord = {
      id: fileId,
      filename,
      original_name: file.name,
      mime_type: file.type,
      size: file.size,
      width,
      height,
      folder,
      r2_key: r2Key,
      public_url: publicUrl,
      thumbnail_url: thumbnailUrl,
      uploaded_by: user.userId,
      uploaded_at: Math.floor(Date.now() / 1e3),
      created_at: Math.floor(Date.now() / 1e3)
    };
    const stmt = c.env.DB.prepare(`
      INSERT INTO media (
        id, filename, original_name, mime_type, size, width, height, 
        folder, r2_key, public_url, thumbnail_url, uploaded_by, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt.bind(
      mediaRecord.id,
      mediaRecord.filename,
      mediaRecord.original_name,
      mediaRecord.mime_type,
      mediaRecord.size,
      mediaRecord.width ?? null,
      mediaRecord.height ?? null,
      mediaRecord.folder,
      mediaRecord.r2_key,
      mediaRecord.public_url,
      mediaRecord.thumbnail_url ?? null,
      mediaRecord.uploaded_by,
      mediaRecord.uploaded_at
    ).run();
    await emitEvent("media.upload", { id: mediaRecord.id, filename: mediaRecord.filename });
    return c.json({
      success: true,
      file: {
        id: mediaRecord.id,
        filename: mediaRecord.filename,
        originalName: mediaRecord.original_name,
        mimeType: mediaRecord.mime_type,
        size: mediaRecord.size,
        width: mediaRecord.width,
        height: mediaRecord.height,
        publicUrl: mediaRecord.public_url,
        thumbnailUrl: mediaRecord.thumbnail_url,
        uploadedAt: new Date(mediaRecord.uploaded_at * 1e3).toISOString()
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
});
apiMediaRoutes.post("/upload-multiple", async (c) => {
  try {
    const user = c.get("user");
    const formData = await c.req.formData();
    const files = formData.getAll("files");
    if (!files || files.length === 0) {
      return c.json({ error: "No files provided" }, 400);
    }
    const uploadResults = [];
    const errors = [];
    for (const file of files) {
      try {
        const validation = fileValidationSchema.safeParse({
          name: file.name,
          type: file.type,
          size: file.size
        });
        if (!validation.success) {
          errors.push({
            filename: file.name,
            error: "Validation failed",
            details: validation.error.issues
          });
          continue;
        }
        const fileId = generateId();
        const fileExtension = file.name.split(".").pop() || "";
        const filename = `${fileId}.${fileExtension}`;
        const folder = formData.get("folder") || "uploads";
        const r2Key = `${folder}/${filename}`;
        const arrayBuffer = await file.arrayBuffer();
        const uploadResult = await c.env.MEDIA_BUCKET.put(r2Key, arrayBuffer, {
          httpMetadata: {
            contentType: file.type,
            contentDisposition: `inline; filename="${file.name}"`
          },
          customMetadata: {
            originalName: file.name,
            uploadedBy: user.userId,
            uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
        if (!uploadResult) {
          errors.push({
            filename: file.name,
            error: "Failed to upload to storage"
          });
          continue;
        }
        const bucketName = c.env.BUCKET_NAME || "sonicjs-media-dev";
        const publicUrl = `https://pub-${bucketName}.r2.dev/${r2Key}`;
        let width;
        let height;
        if (file.type.startsWith("image/") && !file.type.includes("svg")) {
          try {
            const dimensions = await getImageDimensions(arrayBuffer);
            width = dimensions.width;
            height = dimensions.height;
          } catch (error) {
            console.warn("Failed to extract image dimensions:", error);
          }
        }
        let thumbnailUrl;
        if (file.type.startsWith("image/") && c.env.IMAGES_ACCOUNT_ID) {
          thumbnailUrl = `https://imagedelivery.net/${c.env.IMAGES_ACCOUNT_ID}/${r2Key}/thumbnail`;
        }
        const mediaRecord = {
          id: fileId,
          filename,
          original_name: file.name,
          mime_type: file.type,
          size: file.size,
          width,
          height,
          folder,
          r2_key: r2Key,
          public_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          uploaded_by: user.userId,
          uploaded_at: Math.floor(Date.now() / 1e3)
        };
        const stmt = c.env.DB.prepare(`
          INSERT INTO media (
            id, filename, original_name, mime_type, size, width, height, 
            folder, r2_key, public_url, thumbnail_url, uploaded_by, uploaded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        await stmt.bind(
          mediaRecord.id,
          mediaRecord.filename,
          mediaRecord.original_name,
          mediaRecord.mime_type,
          mediaRecord.size,
          mediaRecord.width ?? null,
          mediaRecord.height ?? null,
          mediaRecord.folder,
          mediaRecord.r2_key,
          mediaRecord.public_url,
          mediaRecord.thumbnail_url ?? null,
          mediaRecord.uploaded_by,
          mediaRecord.uploaded_at
        ).run();
        uploadResults.push({
          id: mediaRecord.id,
          filename: mediaRecord.filename,
          originalName: mediaRecord.original_name,
          mimeType: mediaRecord.mime_type,
          size: mediaRecord.size,
          width: mediaRecord.width,
          height: mediaRecord.height,
          publicUrl: mediaRecord.public_url,
          thumbnailUrl: mediaRecord.thumbnail_url,
          uploadedAt: new Date(mediaRecord.uploaded_at * 1e3).toISOString()
        });
      } catch (error) {
        errors.push({
          filename: file.name,
          error: "Upload failed",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    if (uploadResults.length > 0) {
      await emitEvent("media.upload", { count: uploadResults.length });
    }
    return c.json({
      success: uploadResults.length > 0,
      uploaded: uploadResults,
      errors,
      summary: {
        total: files.length,
        successful: uploadResults.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
});
apiMediaRoutes.post("/bulk-delete", async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const fileIds = body.fileIds;
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return c.json({ error: "No file IDs provided" }, 400);
    }
    if (fileIds.length > 50) {
      return c.json({ error: "Too many files selected. Maximum 50 files per operation." }, 400);
    }
    const results = [];
    const errors = [];
    for (const fileId of fileIds) {
      try {
        const stmt = c.env.DB.prepare("SELECT * FROM media WHERE id = ?");
        const fileRecord = await stmt.bind(fileId).first();
        if (!fileRecord) {
          errors.push({ fileId, error: "File not found" });
          continue;
        }
        if (fileRecord.deleted_at !== null) {
          console.log(`File ${fileId} already deleted, skipping`);
          results.push({
            fileId,
            filename: fileRecord.original_name,
            success: true,
            alreadyDeleted: true
          });
          continue;
        }
        if (fileRecord.uploaded_by !== user.userId && user.role !== "admin") {
          errors.push({ fileId, error: "Permission denied" });
          continue;
        }
        try {
          await c.env.MEDIA_BUCKET.delete(fileRecord.r2_key);
        } catch (error) {
          console.warn(`Failed to delete from R2 for file ${fileId}:`, error);
        }
        const deleteStmt = c.env.DB.prepare("UPDATE media SET deleted_at = ? WHERE id = ?");
        await deleteStmt.bind(Math.floor(Date.now() / 1e3), fileId).run();
        results.push({
          fileId,
          filename: fileRecord.original_name,
          success: true
        });
      } catch (error) {
        errors.push({
          fileId,
          error: "Delete failed",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    if (results.length > 0) {
      await emitEvent("media.delete", { count: results.length, ids: fileIds });
    }
    return c.json({
      success: results.length > 0,
      deleted: results,
      errors,
      summary: {
        total: fileIds.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return c.json({ error: "Bulk delete failed" }, 500);
  }
});
apiMediaRoutes.post("/create-folder", async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const folderName = body.folderName;
    if (!folderName || typeof folderName !== "string") {
      return c.json({ success: false, error: "No folder name provided" }, 400);
    }
    const folderPattern = /^[a-z0-9-_]+$/;
    if (!folderPattern.test(folderName)) {
      return c.json({
        success: false,
        error: "Folder name can only contain lowercase letters, numbers, hyphens, and underscores"
      }, 400);
    }
    const checkStmt = c.env.DB.prepare("SELECT COUNT(*) as count FROM media WHERE folder = ? AND deleted_at IS NULL");
    const existingFolder = await checkStmt.bind(folderName).first();
    return c.json({
      success: true,
      message: `Folder "${folderName}" created successfully`,
      folder: folderName
    });
  } catch (error) {
    console.error("Create folder error:", error);
    return c.json({ success: false, error: "Failed to create folder" }, 500);
  }
});
apiMediaRoutes.post("/bulk-move", async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const fileIds = body.fileIds;
    const targetFolder = body.folder;
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return c.json({ error: "No file IDs provided" }, 400);
    }
    if (!targetFolder || typeof targetFolder !== "string") {
      return c.json({ error: "No target folder provided" }, 400);
    }
    if (fileIds.length > 50) {
      return c.json({ error: "Too many files selected. Maximum 50 files per operation." }, 400);
    }
    const results = [];
    const errors = [];
    for (const fileId of fileIds) {
      try {
        const stmt = c.env.DB.prepare("SELECT * FROM media WHERE id = ? AND deleted_at IS NULL");
        const fileRecord = await stmt.bind(fileId).first();
        if (!fileRecord) {
          errors.push({ fileId, error: "File not found" });
          continue;
        }
        if (fileRecord.uploaded_by !== user.userId && user.role !== "admin") {
          errors.push({ fileId, error: "Permission denied" });
          continue;
        }
        if (fileRecord.folder === targetFolder) {
          results.push({
            fileId,
            filename: fileRecord.original_name,
            success: true,
            skipped: true
          });
          continue;
        }
        const oldR2Key = fileRecord.r2_key;
        const filename = oldR2Key.split("/").pop() || fileRecord.filename;
        const newR2Key = `${targetFolder}/${filename}`;
        try {
          const object = await c.env.MEDIA_BUCKET.get(oldR2Key);
          if (!object) {
            errors.push({ fileId, error: "File not found in storage" });
            continue;
          }
          await c.env.MEDIA_BUCKET.put(newR2Key, object.body, {
            httpMetadata: object.httpMetadata,
            customMetadata: {
              ...object.customMetadata,
              movedBy: user.userId,
              movedAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          });
          await c.env.MEDIA_BUCKET.delete(oldR2Key);
        } catch (error) {
          console.warn(`Failed to move file in R2 for file ${fileId}:`, error);
          errors.push({ fileId, error: "Failed to move file in storage" });
          continue;
        }
        const bucketName = c.env.BUCKET_NAME || "sonicjs-media-dev";
        const newPublicUrl = `https://pub-${bucketName}.r2.dev/${newR2Key}`;
        const updateStmt = c.env.DB.prepare(`
          UPDATE media
          SET folder = ?, r2_key = ?, public_url = ?, updated_at = ?
          WHERE id = ?
        `);
        await updateStmt.bind(
          targetFolder,
          newR2Key,
          newPublicUrl,
          Math.floor(Date.now() / 1e3),
          fileId
        ).run();
        results.push({
          fileId,
          filename: fileRecord.original_name,
          success: true,
          skipped: false
        });
      } catch (error) {
        errors.push({
          fileId,
          error: "Move failed",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    if (results.length > 0) {
      await emitEvent("media.move", { count: results.length, targetFolder, ids: fileIds });
    }
    return c.json({
      success: results.length > 0,
      moved: results,
      errors,
      summary: {
        total: fileIds.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error("Bulk move error:", error);
    return c.json({ error: "Bulk move failed" }, 500);
  }
});
apiMediaRoutes.delete("/:id", async (c) => {
  try {
    const user = c.get("user");
    const fileId = c.req.param("id");
    const stmt = c.env.DB.prepare("SELECT * FROM media WHERE id = ? AND deleted_at IS NULL");
    const fileRecord = await stmt.bind(fileId).first();
    if (!fileRecord) {
      return c.json({ error: "File not found" }, 404);
    }
    if (fileRecord.uploaded_by !== user.userId && user.role !== "admin") {
      return c.json({ error: "Permission denied" }, 403);
    }
    try {
      await c.env.MEDIA_BUCKET.delete(fileRecord.r2_key);
    } catch (error) {
      console.warn("Failed to delete from R2:", error);
    }
    const deleteStmt = c.env.DB.prepare("UPDATE media SET deleted_at = ? WHERE id = ?");
    await deleteStmt.bind(Math.floor(Date.now() / 1e3), fileId).run();
    await emitEvent("media.delete", { id: fileId });
    return c.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return c.json({ error: "Delete failed" }, 500);
  }
});
apiMediaRoutes.patch("/:id", async (c) => {
  try {
    const user = c.get("user");
    const fileId = c.req.param("id");
    const body = await c.req.json();
    const stmt = c.env.DB.prepare("SELECT * FROM media WHERE id = ? AND deleted_at IS NULL");
    const fileRecord = await stmt.bind(fileId).first();
    if (!fileRecord) {
      return c.json({ error: "File not found" }, 404);
    }
    if (fileRecord.uploaded_by !== user.userId && user.role !== "admin") {
      return c.json({ error: "Permission denied" }, 403);
    }
    const allowedFields = ["alt", "caption", "tags", "folder"];
    const updates = [];
    const values = [];
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(key === "tags" ? JSON.stringify(value) : value);
      }
    }
    if (updates.length === 0) {
      return c.json({ error: "No valid fields to update" }, 400);
    }
    updates.push("updated_at = ?");
    values.push(Math.floor(Date.now() / 1e3));
    values.push(fileId);
    const updateStmt = c.env.DB.prepare(`
      UPDATE media SET ${updates.join(", ")} WHERE id = ?
    `);
    await updateStmt.bind(...values).run();
    await emitEvent("media.update", { id: fileId });
    return c.json({ success: true, message: "File updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    return c.json({ error: "Update failed" }, 500);
  }
});
async function getImageDimensions(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  if (uint8Array[0] === 255 && uint8Array[1] === 216) {
    return getJPEGDimensions(uint8Array);
  }
  if (uint8Array[0] === 137 && uint8Array[1] === 80 && uint8Array[2] === 78 && uint8Array[3] === 71) {
    return getPNGDimensions(uint8Array);
  }
  return { width: 0, height: 0 };
}
function getJPEGDimensions(uint8Array) {
  let i = 2;
  while (i < uint8Array.length) {
    if (i + 8 >= uint8Array.length) break;
    if (uint8Array[i] === 255 && uint8Array[i + 1] === 192) {
      if (i + 8 < uint8Array.length) {
        return {
          height: uint8Array[i + 5] << 8 | uint8Array[i + 6],
          width: uint8Array[i + 7] << 8 | uint8Array[i + 8]
        };
      }
    }
    if (i + 3 < uint8Array.length) {
      i += 2 + (uint8Array[i + 2] << 8 | uint8Array[i + 3]);
    } else {
      break;
    }
  }
  return { width: 0, height: 0 };
}
function getPNGDimensions(uint8Array) {
  if (uint8Array.length < 24) {
    return { width: 0, height: 0 };
  }
  return {
    width: uint8Array[16] << 24 | uint8Array[17] << 16 | uint8Array[18] << 8 | uint8Array[19],
    height: uint8Array[20] << 24 | uint8Array[21] << 16 | uint8Array[22] << 8 | uint8Array[23]
  };
}
var api_media_default = apiMediaRoutes;
var apiSystemRoutes = new hono.Hono();
apiSystemRoutes.get("/health", async (c) => {
  try {
    const startTime = Date.now();
    let dbStatus = "unknown";
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await c.env.DB.prepare("SELECT 1").first();
      dbLatency = Date.now() - dbStart;
      dbStatus = "healthy";
    } catch (error) {
      console.error("Database health check failed:", error);
      dbStatus = "unhealthy";
    }
    let kvStatus = "not_configured";
    let kvLatency = 0;
    if (c.env.CACHE_KV) {
      try {
        const kvStart = Date.now();
        await c.env.CACHE_KV.get("__health_check__");
        kvLatency = Date.now() - kvStart;
        kvStatus = "healthy";
      } catch (error) {
        console.error("KV health check failed:", error);
        kvStatus = "unhealthy";
      }
    }
    let r2Status = "not_configured";
    if (c.env.MEDIA_BUCKET) {
      try {
        await c.env.MEDIA_BUCKET.head("__health_check__");
        r2Status = "healthy";
      } catch (error) {
        r2Status = "healthy";
      }
    }
    const totalLatency = Date.now() - startTime;
    const overall = dbStatus === "healthy" ? "healthy" : "degraded";
    return c.json({
      status: overall,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: totalLatency,
      checks: {
        database: {
          status: dbStatus,
          latency: dbLatency
        },
        cache: {
          status: kvStatus,
          latency: kvLatency
        },
        storage: {
          status: r2Status
        }
      },
      environment: c.env.ENVIRONMENT || "production"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return c.json({
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      error: "Health check failed"
    }, 503);
  }
});
apiSystemRoutes.get("/info", (c) => {
  const appVersion = c.get("appVersion") || "1.0.0";
  return c.json({
    name: "SonicJS",
    version: appVersion,
    description: "Modern headless CMS built on Cloudflare Workers",
    endpoints: {
      api: "/api",
      auth: "/auth",
      health: "/api/system/health",
      docs: "/docs"
    },
    features: {
      content: true,
      media: true,
      auth: true,
      collections: true,
      caching: !!c.env.CACHE_KV,
      storage: !!c.env.MEDIA_BUCKET
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiSystemRoutes.get("/stats", async (c) => {
  try {
    const db = c.env.DB;
    const contentStats = await db.prepare(`
      SELECT COUNT(*) as total_content
      FROM content
      WHERE deleted_at IS NULL
    `).first();
    const mediaStats = await db.prepare(`
      SELECT
        COUNT(*) as total_files,
        SUM(size) as total_size
      FROM media
      WHERE deleted_at IS NULL
    `).first();
    const userStats = await db.prepare(`
      SELECT COUNT(*) as total_users
      FROM users
    `).first();
    return c.json({
      content: {
        total: contentStats?.total_content || 0
      },
      media: {
        total_files: mediaStats?.total_files || 0,
        total_size_bytes: mediaStats?.total_size || 0,
        total_size_mb: Math.round((mediaStats?.total_size || 0) / 1024 / 1024 * 100) / 100
      },
      users: {
        total: userStats?.total_users || 0
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Stats query failed:", error);
    return c.json({ error: "Failed to fetch system statistics" }, 500);
  }
});
apiSystemRoutes.get("/ping", async (c) => {
  try {
    const start = Date.now();
    await c.env.DB.prepare("SELECT 1").first();
    const latency = Date.now() - start;
    return c.json({
      pong: true,
      latency,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Ping failed:", error);
    return c.json({
      pong: false,
      error: "Database connection failed"
    }, 503);
  }
});
apiSystemRoutes.get("/env", (c) => {
  return c.json({
    environment: c.env.ENVIRONMENT || "production",
    features: {
      database: !!c.env.DB,
      cache: !!c.env.CACHE_KV,
      media_bucket: !!c.env.MEDIA_BUCKET,
      email_queue: !!c.env.EMAIL_QUEUE,
      sendgrid: !!c.env.SENDGRID_API_KEY,
      cloudflare_images: !!(c.env.IMAGES_ACCOUNT_ID && c.env.IMAGES_API_TOKEN)
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var api_system_default = apiSystemRoutes;
var zValidator = (target, schema, hook, options) => (
  // @ts-expect-error not typed well
  validator.validator(target, async (value, c) => {
    let validatorValue = value;
    const result = (
      // @ts-expect-error z4.$ZodType has safeParseAsync
      await schema.safeParseAsync(validatorValue)
    );
    if (!result.success) {
      return c.json(result, 400);
    }
    return result.data;
  })
);

// src/routes/admin-api.ts
var adminApiRoutes = new hono.Hono();
adminApiRoutes.use("*", chunk24PWAFUT_cjs.requireAuth());
adminApiRoutes.use("*", chunk24PWAFUT_cjs.requireRole(["admin", "editor"]));
adminApiRoutes.get("/stats", async (c) => {
  try {
    const db = c.env.DB;
    let collectionsCount = 0;
    try {
      const collectionsStmt = db.prepare("SELECT COUNT(*) as count FROM collections WHERE is_active = 1");
      const collectionsResult = await collectionsStmt.first();
      collectionsCount = collectionsResult?.count || 0;
    } catch (error) {
      console.error("Error fetching collections count:", error);
    }
    let contentCount = 0;
    try {
      const contentStmt = db.prepare("SELECT COUNT(*) as count FROM content WHERE deleted_at IS NULL");
      const contentResult = await contentStmt.first();
      contentCount = contentResult?.count || 0;
    } catch (error) {
      console.error("Error fetching content count:", error);
    }
    let mediaCount = 0;
    let mediaSize = 0;
    try {
      const mediaStmt = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(size), 0) as total_size FROM media WHERE deleted_at IS NULL");
      const mediaResult = await mediaStmt.first();
      mediaCount = mediaResult?.count || 0;
      mediaSize = mediaResult?.total_size || 0;
    } catch (error) {
      console.error("Error fetching media count:", error);
    }
    let usersCount = 0;
    try {
      const usersStmt = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_active = 1");
      const usersResult = await usersStmt.first();
      usersCount = usersResult?.count || 0;
    } catch (error) {
      console.error("Error fetching users count:", error);
    }
    return c.json({
      collections: collectionsCount,
      contentItems: contentCount,
      mediaFiles: mediaCount,
      mediaSize,
      users: usersCount,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json({ error: "Failed to fetch statistics" }, 500);
  }
});
adminApiRoutes.get("/storage", async (c) => {
  try {
    const db = c.env.DB;
    let databaseSize = 0;
    try {
      const result = await db.prepare("SELECT 1").run();
      databaseSize = result?.meta?.size_after || 0;
    } catch (error) {
      console.error("Error fetching database size:", error);
    }
    let mediaSize = 0;
    try {
      const mediaStmt = db.prepare("SELECT COALESCE(SUM(size), 0) as total_size FROM media WHERE deleted_at IS NULL");
      const mediaResult = await mediaStmt.first();
      mediaSize = mediaResult?.total_size || 0;
    } catch (error) {
      console.error("Error fetching media size:", error);
    }
    return c.json({
      databaseSize,
      mediaSize,
      totalSize: databaseSize + mediaSize,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error fetching storage usage:", error);
    return c.json({ error: "Failed to fetch storage usage" }, 500);
  }
});
adminApiRoutes.get("/activity", async (c) => {
  try {
    const db = c.env.DB;
    const limit = parseInt(c.req.query("limit") || "10");
    const activityStmt = db.prepare(`
      SELECT
        a.id,
        a.action,
        a.resource_type,
        a.resource_id,
        a.details,
        a.created_at,
        u.email,
        u.first_name,
        u.last_name
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.resource_type IN ('content', 'collections', 'users', 'media')
      ORDER BY a.created_at DESC
      LIMIT ?
    `);
    const { results } = await activityStmt.bind(limit).all();
    const recentActivity = (results || []).map((row) => {
      const userName = row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : row.email || "System";
      let details = {};
      try {
        details = row.details ? JSON.parse(row.details) : {};
      } catch (e) {
        console.error("Error parsing activity details:", e);
      }
      return {
        id: row.id,
        type: row.resource_type,
        action: row.action,
        resource_id: row.resource_id,
        details,
        timestamp: new Date(Number(row.created_at)).toISOString(),
        user: userName
      };
    });
    return c.json({
      data: recentActivity,
      count: recentActivity.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return c.json({ error: "Failed to fetch recent activity" }, 500);
  }
});
var createCollectionSchema = zod.z.object({
  name: zod.z.string().min(1).max(255).regex(/^[a-z0-9_]+$/, "Must contain only lowercase letters, numbers, and underscores"),
  display_name: zod.z.string().min(1).max(255),
  description: zod.z.string().optional()
});
var updateCollectionSchema = zod.z.object({
  display_name: zod.z.string().min(1).max(255).optional(),
  description: zod.z.string().optional(),
  is_active: zod.z.boolean().optional()
});
adminApiRoutes.get("/collections", async (c) => {
  try {
    const db = c.env.DB;
    const search = c.req.query("search") || "";
    const includeInactive = c.req.query("includeInactive") === "true";
    let stmt;
    let results;
    if (search) {
      stmt = db.prepare(`
        SELECT id, name, display_name, description, created_at, updated_at, is_active, managed
        FROM collections
        WHERE ${includeInactive ? "1=1" : "is_active = 1"}
        AND (name LIKE ? OR display_name LIKE ? OR description LIKE ?)
        ORDER BY created_at DESC
      `);
      const searchParam = `%${search}%`;
      const queryResults = await stmt.bind(searchParam, searchParam, searchParam).all();
      results = queryResults.results;
    } else {
      stmt = db.prepare(`
        SELECT id, name, display_name, description, created_at, updated_at, is_active, managed
        FROM collections
        ${includeInactive ? "" : "WHERE is_active = 1"}
        ORDER BY created_at DESC
      `);
      const queryResults = await stmt.all();
      results = queryResults.results;
    }
    const fieldCountStmt = db.prepare("SELECT collection_id, COUNT(*) as count FROM content_fields GROUP BY collection_id");
    const { results: fieldCountResults } = await fieldCountStmt.all();
    const fieldCounts = new Map((fieldCountResults || []).map((row) => [String(row.collection_id), Number(row.count)]));
    const collections = (results || []).map((row) => ({
      id: row.id,
      name: row.name,
      display_name: row.display_name,
      description: row.description,
      created_at: Number(row.created_at),
      updated_at: Number(row.updated_at),
      is_active: row.is_active === 1,
      managed: row.managed === 1,
      field_count: fieldCounts.get(String(row.id)) || 0
    }));
    return c.json({
      data: collections,
      count: collections.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return c.json({ error: "Failed to fetch collections" }, 500);
  }
});
adminApiRoutes.get("/collections/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const stmt = db.prepare("SELECT * FROM collections WHERE id = ?");
    const collection = await stmt.bind(id).first();
    if (!collection) {
      return c.json({ error: "Collection not found" }, 404);
    }
    const fieldsStmt = db.prepare(`
      SELECT * FROM content_fields
      WHERE collection_id = ?
      ORDER BY field_order ASC
    `);
    const { results: fieldsResults } = await fieldsStmt.bind(id).all();
    const fields = (fieldsResults || []).map((row) => ({
      id: row.id,
      field_name: row.field_name,
      field_type: row.field_type,
      field_label: row.field_label,
      field_options: row.field_options ? JSON.parse(row.field_options) : {},
      field_order: row.field_order,
      is_required: row.is_required === 1,
      is_searchable: row.is_searchable === 1,
      created_at: Number(row.created_at),
      updated_at: Number(row.updated_at)
    }));
    return c.json({
      data: {
        ...collection,
        is_active: collection.is_active === 1,
        managed: collection.managed === 1,
        schema: collection.schema ? JSON.parse(collection.schema) : null,
        created_at: Number(collection.created_at),
        updated_at: Number(collection.updated_at),
        fields
      }
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return c.json({ error: "Failed to fetch collection" }, 500);
  }
});
adminApiRoutes.post(
  "/collections",
  zValidator("json", createCollectionSchema),
  async (c) => {
    try {
      const validatedData = c.req.valid("json");
      const db = c.env.DB;
      const user = c.get("user");
      const existingStmt = db.prepare("SELECT id FROM collections WHERE name = ?");
      const existing = await existingStmt.bind(validatedData.name).first();
      if (existing) {
        return c.json({ error: "A collection with this name already exists" }, 400);
      }
      const basicSchema = {
        type: "object",
        properties: {
          title: {
            type: "string",
            title: "Title",
            required: true
          },
          content: {
            type: "string",
            title: "Content",
            format: "richtext"
          },
          status: {
            type: "string",
            title: "Status",
            enum: ["draft", "published", "archived"],
            default: "draft"
          }
        },
        required: ["title"]
      };
      const collectionId = crypto.randomUUID();
      const now = Date.now();
      const insertStmt = db.prepare(`
        INSERT INTO collections (id, name, display_name, description, schema, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      await insertStmt.bind(
        collectionId,
        validatedData.name,
        validatedData.display_name,
        validatedData.description || null,
        JSON.stringify(basicSchema),
        1,
        // is_active
        now,
        now
      ).run();
      try {
        await c.env.CACHE_KV.delete("cache:collections:all");
        await c.env.CACHE_KV.delete(`cache:collection:${validatedData.name}`);
      } catch (e) {
        console.error("Error clearing cache:", e);
      }
      return c.json({
        data: {
          id: collectionId,
          name: validatedData.name,
          display_name: validatedData.display_name,
          description: validatedData.description,
          created_at: now
        }
      }, 201);
    } catch (error) {
      console.error("Error creating collection:", error);
      return c.json({ error: "Failed to create collection" }, 500);
    }
  }
);
adminApiRoutes.patch(
  "/collections/:id",
  zValidator("json", updateCollectionSchema),
  async (c) => {
    try {
      const id = c.req.param("id");
      const validatedData = c.req.valid("json");
      const db = c.env.DB;
      const checkStmt = db.prepare("SELECT * FROM collections WHERE id = ?");
      const existing = await checkStmt.bind(id).first();
      if (!existing) {
        return c.json({ error: "Collection not found" }, 404);
      }
      const updateFields = [];
      const updateParams = [];
      if (validatedData.display_name !== void 0) {
        updateFields.push("display_name = ?");
        updateParams.push(validatedData.display_name);
      }
      if (validatedData.description !== void 0) {
        updateFields.push("description = ?");
        updateParams.push(validatedData.description);
      }
      if (validatedData.is_active !== void 0) {
        updateFields.push("is_active = ?");
        updateParams.push(validatedData.is_active ? 1 : 0);
      }
      if (updateFields.length === 0) {
        return c.json({ error: "No fields to update" }, 400);
      }
      updateFields.push("updated_at = ?");
      updateParams.push(Date.now());
      updateParams.push(id);
      const updateStmt = db.prepare(`
        UPDATE collections
        SET ${updateFields.join(", ")}
        WHERE id = ?
      `);
      await updateStmt.bind(...updateParams).run();
      try {
        await c.env.CACHE_KV.delete("cache:collections:all");
        await c.env.CACHE_KV.delete(`cache:collection:${existing.name}`);
      } catch (e) {
        console.error("Error clearing cache:", e);
      }
      return c.json({ message: "Collection updated successfully" });
    } catch (error) {
      console.error("Error updating collection:", error);
      return c.json({ error: "Failed to update collection" }, 500);
    }
  }
);
adminApiRoutes.delete("/collections/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const contentStmt = db.prepare("SELECT COUNT(*) as count FROM content WHERE collection_id = ?");
    const contentResult = await contentStmt.bind(id).first();
    if (contentResult && contentResult.count > 0) {
      return c.json({
        error: `Cannot delete collection: it contains ${contentResult.count} content item(s). Delete all content first.`
      }, 400);
    }
    const collectionStmt = db.prepare("SELECT name FROM collections WHERE id = ?");
    const collection = await collectionStmt.bind(id).first();
    const deleteFieldsStmt = db.prepare("DELETE FROM content_fields WHERE collection_id = ?");
    await deleteFieldsStmt.bind(id).run();
    const deleteStmt = db.prepare("DELETE FROM collections WHERE id = ?");
    await deleteStmt.bind(id).run();
    try {
      await c.env.CACHE_KV.delete("cache:collections:all");
      if (collection) {
        await c.env.CACHE_KV.delete(`cache:collection:${collection.name}`);
      }
    } catch (e) {
      console.error("Error clearing cache:", e);
    }
    return c.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return c.json({ error: "Failed to delete collection" }, 500);
  }
});
var admin_api_default = adminApiRoutes;

// src/templates/components/alert.template.ts
function renderAlert(data) {
  const typeClasses = {
    success: "bg-green-50 dark:bg-green-500/10 border border-green-600/20 dark:border-green-500/20",
    error: "bg-error/10 border border-red-600/20 dark:border-red-500/20",
    warning: "bg-amber-50 dark:bg-amber-500/10 border border-amber-600/20 dark:border-amber-500/20",
    info: "bg-blue-50 dark:bg-blue-500/10 border border-blue-600/20 dark:border-blue-500/20"
  };
  const iconClasses = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
    info: "text-blue-600 dark:text-blue-400"
  };
  const textClasses = {
    success: "text-green-900 dark:text-green-300",
    error: "text-red-900 dark:text-red-300",
    warning: "text-amber-900 dark:text-amber-300",
    info: "text-blue-900 dark:text-blue-300"
  };
  const messageTextClasses = {
    success: "text-green-700 dark:text-green-400",
    error: "text-red-700 dark:text-red-400",
    warning: "text-amber-700 dark:text-amber-400",
    info: "text-blue-700 dark:text-blue-400"
  };
  const icons = {
    success: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />`,
    error: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />`,
    warning: `<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />`,
    info: `<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />`
  };
  return `
    <div class="rounded-lg p-4 ${typeClasses[data.type]} ${data.className || ""}" ${data.dismissible ? 'id="dismissible-alert"' : ""}>
      <div class="flex">
        ${data.icon !== false ? `
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 ${iconClasses[data.type]}" viewBox="0 0 20 20" fill="currentColor">
              ${icons[data.type]}
            </svg>
          </div>
        ` : ""}
        <div class="${data.icon !== false ? "ml-3" : ""}">
          ${data.title ? `
            <h3 class="text-sm font-semibold ${textClasses[data.type]}">
              ${data.title}
            </h3>
          ` : ""}
          <div class="${data.title ? "mt-1 text-sm" : "text-sm"} ${messageTextClasses[data.type]}">
            <p>${data.message}</p>
          </div>
        </div>
        ${data.dismissible ? `
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button
                type="button"
                class="inline-flex rounded-md p-1.5 ${iconClasses[data.type]} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2"
                onclick="document.getElementById('dismissible-alert').remove()"
              >
                <span class="sr-only">Dismiss</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

// src/templates/pages/auth-login.template.ts
function renderLoginPage(data, demoLoginActive = false) {
  return `
    <!DOCTYPE html>
    <html lang="en" class="h-full dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - SonicJS AI</title>
      <link rel="icon" type="image/x-icon" href="https://demo.sonicjs.com/images/favicon.ico">
      <script src="https://unpkg.com/htmx.org@2.0.3"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                error: '#ef4444'
              }
            }
          }
        }
      </script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      </style>
    </head>
    <body class="h-full bg-zinc-950">
      <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <!-- Logo Section -->
        <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div class="mx-auto w-64 mb-8">
            <svg class="w-full h-auto" viewBox="380 1300 2250 400" aria-hidden="true">
              <path fill="#F1F2F2" d="M476.851,1404.673h168.536c4.714,0,8.695-1.618,11.944-4.866c3.241-3.241,4.866-7.222,4.866-11.943    c0-2.357-0.443-4.569-1.327-6.636c-0.885-2.06-2.067-3.829-3.539-5.308c-1.479-1.472-3.249-2.654-5.308-3.538    c-2.067-0.885-4.279-1.327-6.635-1.327H476.851c-20.057,0-37.158,7.154-51.313,21.454c-14.155,14.308-21.233,31.483-21.233,51.534    c0,20.058,7.078,37.234,21.233,51.534c14.155,14.308,31.255,21.454,51.313,21.454h112.357c10.907,0,20.196,3.837,27.868,11.502    c7.666,7.672,11.502,16.885,11.502,27.646c0,10.769-3.836,19.982-11.502,27.647c-7.672,7.673-16.961,11.502-27.868,11.502H421.115    c-4.721,0-8.702,1.624-11.944,4.865c-3.248,3.249-4.866,7.23-4.866,11.944c0,3.248,0.733,6.123,2.212,8.626    c1.472,2.509,3.462,4.499,5.971,5.972c2.502,1.472,5.378,2.212,8.626,2.212h168.094c20.052,0,37.227-7.078,51.534-21.234    c14.3-14.155,21.454-31.331,21.454-51.534c0-20.196-7.154-37.379-21.454-51.534c-14.308-14.156-31.483-21.234-51.534-21.234    H476.851c-10.616,0-19.76-3.905-27.426-11.721c-7.672-7.811-11.501-17.101-11.501-27.87c0-10.761,3.829-19.975,11.501-27.647    C457.091,1408.508,466.235,1404.673,476.851,1404.673z"></path>
              <path fill="#F1F2F2" d="M974.78,1398.211c-5.016,6.574-10.034,13.146-15.048,19.721c-1.828,2.398-3.657,4.796-5.487,7.194    c1.994,1.719,3.958,3.51,5.873,5.424c18.724,18.731,28.089,41.216,28.089,67.459c0,26.251-9.366,48.658-28.089,67.237    c-18.731,18.579-41.215,27.868-67.459,27.868c-9.848,0-19.156-1.308-27.923-3.923l-4.185,3.354    c-8.587,6.885-17.154,13.796-25.725,20.702c17.52,8.967,36.86,13.487,58.054,13.487c35.533,0,65.91-12.608,91.124-37.821    c25.214-25.215,37.821-55.584,37.821-91.125c0-35.534-12.607-65.911-37.821-91.126    C981.004,1403.663,977.926,1400.854,974.78,1398.211z"></path>
              <path fill="#F1F2F2" d="M1364.644,1439.619c-4.72,0-8.702,1.624-11.943,4.865c-3.249,3.249-4.866,7.23-4.866,11.944v138.014    l-167.651-211.003c-0.297-0.586-0.74-1.03-1.327-1.326c-4.721-4.714-10.249-7.742-16.588-9.069    c-6.346-1.326-12.608-0.732-18.801,1.77c-6.192,2.509-11.059,6.49-14.598,11.944c-3.539,5.46-5.308,11.577-5.308,18.357v208.348    c0,4.721,1.618,8.703,4.866,11.944c3.241,3.241,7.222,4.865,11.943,4.865c2.945,0,5.751-0.738,8.405-2.211    c2.654-1.472,4.713-3.463,6.193-5.971c1.473-2.503,2.212-5.378,2.212-8.627v-205.251l166.325,209.675    c2.06,2.654,4.423,4.865,7.078,6.635c5.308,3.829,11.349,5.75,18.137,5.75c5.308,0,10.464-1.182,15.482-3.538    c3.539-1.769,6.56-4.127,9.069-7.078c2.502-2.945,4.491-6.338,5.971-10.175c1.473-3.829,2.212-7.664,2.212-11.501v-141.552    c0-4.714-1.624-8.695-4.865-11.944C1373.339,1441.243,1369.359,1439.619,1364.644,1439.619z"></path>
              <path fill="#F1F2F2" d="M1508.406,1432.983c-2.654-1.472-5.46-2.212-8.404-2.212c-4.721,0-8.703,1.7-11.944,5.087    c-3.249,3.395-4.865,7.3-4.865,11.723v163.228c0,4.721,1.616,8.702,4.865,11.943c3.241,3.249,7.223,4.866,11.944,4.866    c2.944,0,5.751-0.732,8.404-2.212c2.655-1.472,4.714-3.539,6.193-6.194c1.473-2.654,2.213-5.453,2.213-8.404V1447.58    c0-2.945-0.74-5.75-2.213-8.405C1513.12,1436.522,1511.06,1434.462,1508.406,1432.983z"></path>
              <path fill="#F1F2F2" d="M1499.78,1367.957c-4.575,0-8.481,1.625-11.722,4.866c-3.249,3.249-4.865,7.23-4.865,11.943    c0,2.951,0.732,5.75,2.212,8.405c1.472,2.654,3.463,4.721,5.971,6.193c2.503,1.479,5.378,2.212,8.627,2.212    c4.423,0,8.328-1.618,11.721-4.865c3.387-3.243,5.088-7.224,5.088-11.944c0-4.713-1.701-8.694-5.088-11.943    C1508.33,1369.582,1504.349,1367.957,1499.78,1367.957z"></path>
              <path fill="#F1F2F2" d="M1859.627,1369.727H1747.27c-35.388,0-65.69,12.607-90.904,37.821    c-25.213,25.215-37.82,55.591-37.82,91.125c0,35.54,12.607,65.911,37.82,91.125c25.215,25.215,55.516,37.821,90.904,37.821h56.178    c4.714,0,8.695-1.618,11.944-4.866c3.241-3.241,4.865-7.222,4.865-11.943c0-4.714-1.624-8.695-4.865-11.943    c-3.249-3.243-7.23-4.866-11.944-4.866h-56.178c-26.251,0-48.659-9.359-67.237-28.09c-18.579-18.723-27.868-41.207-27.868-67.459    c0-26.243,9.29-48.659,27.868-67.237c18.579-18.579,40.987-27.868,67.237-27.868h112.357c4.714,0,8.696-1.693,11.944-5.087    c3.241-3.387,4.865-7.368,4.865-11.943c0-4.569-1.624-8.475-4.865-11.723C1868.322,1371.351,1864.341,1369.727,1859.627,1369.727z    "></path>
              <path fill="#06b6d4" d="M2219.256,1371.054h-112.357c-4.423,0-8.336,1.624-11.723,4.865c-3.393,3.249-5.087,7.23-5.087,11.944    c0,4.721,1.694,8.702,5.087,11.943c3.387,3.249,7.3,4.866,11.723,4.866h95.547v95.105c0,26.251-9.365,48.659-28.088,67.237    c-18.731,18.579-41.215,27.868-67.459,27.868c-26.251,0-48.659-9.289-67.237-27.868c-18.579-18.579-27.868-40.987-27.868-67.237    c0-4.713-1.701-8.771-5.088-12.165c-3.393-3.387-7.374-5.087-11.943-5.087c-4.575,0-8.481,1.7-11.722,5.087    c-3.249,3.393-4.865,7.451-4.865,12.165c0,35.388,12.607,65.69,37.82,90.904c25.215,25.213,55.584,37.82,91.126,37.82    c35.532,0,65.91-12.607,91.125-37.82c25.214-25.215,37.82-55.516,37.82-90.904v-111.915c0-4.714-1.624-8.695-4.865-11.944    C2227.951,1372.678,2223.971,1371.054,2219.256,1371.054z"></path>
              <path fill="#06b6d4" d="M2574.24,1502.875c-14.306-14.156-31.483-21.234-51.533-21.234H2410.35    c-10.617,0-19.762-3.829-27.426-11.501c-7.672-7.664-11.501-16.954-11.501-27.868c0-10.907,3.829-20.196,11.501-27.868    c7.664-7.664,16.809-11.501,27.426-11.501h112.357c4.714,0,8.695-1.617,11.944-4.866c3.241-3.241,4.865-7.222,4.865-11.943    c0-4.714-1.624-8.695-4.865-11.944c-3.249-3.241-7.23-4.865-11.944-4.865H2410.35c-20.058,0-37.158,7.154-51.313,21.454    c-14.156,14.308-21.232,31.483-21.232,51.534c0,20.058,7.077,37.234,21.232,51.534c14.156,14.308,31.255,21.454,51.313,21.454    h112.357c7.078,0,13.637,1.77,19.684,5.308c6.042,3.539,10.838,8.336,14.377,14.377c3.538,6.047,5.307,12.607,5.307,19.685    c0,10.616-3.835,19.76-11.501,27.425c-7.672,7.673-16.961,11.502-27.868,11.502h-168.094c-4.721,0-8.703,1.7-11.944,5.087    c-3.249,3.393-4.865,7.374-4.865,11.943c0,4.576,1.616,8.481,4.865,11.723c3.241,3.249,7.223,4.866,11.944,4.866h168.094    c20.051,0,37.227-7.078,51.533-21.234c14.302-14.155,21.454-31.331,21.454-51.534    C2595.695,1534.213,2588.542,1517.03,2574.24,1502.875z"></path>
              <path fill="#06b6d4" d="M854.024,1585.195l20.001-16.028c16.616-13.507,33.04-27.265,50.086-40.251    c1.13-0.861,2.9-1.686,2.003-3.516c-0.843-1.716-2.481-2.302-4.484-2.123c-8.514,0.765-17.016-0.538-25.537-0.353    c-1.124,0.024-2.768,0.221-3.163-1.25c-0.371-1.369,1.088-2.063,1.919-2.894c6.26-6.242,12.574-12.43,18.816-18.691    c9.303-9.327,18.565-18.714,27.851-28.066c1.848-1.859,3.701-3.713,5.549-5.572c2.655-2.661,5.309-5.315,7.958-7.982    c0.574-0.579,1.259-1.141,1.246-1.94c-0.004-0.257-0.078-0.538-0.254-0.853c-0.556-0.981-1.441-1.1-2.469-0.957    c-0.658,0.096-1.315,0.185-1.973,0.275c-3.844,0.538-7.689,1.076-11.533,1.608c-3.641,0.505-7.281,1.02-10.922,1.529    c-4.162,0.582-8.324,1.158-12.486,1.748c-1.142,0.161-2.409,1.662-3.354,0.508c-0.419-0.508-0.431-1.028-0.251-1.531    c0.269-0.741,0.957-1.441,1.387-2.021c3.414-4.58,6.882-9.124,10.356-13.662c1.74-2.272,3.48-4.544,5.214-6.822    c4.682-6.141,9.369-12.281,14.051-18.422c0.09-0.119,0.181-0.237,0.271-0.355c6.848-8.98,13.7-17.958,20.553-26.936    c0.488-0.64,0.977-1.28,1.465-1.92c2.159-2.828,4.315-5.658,6.476-8.486c4.197-5.501,8.454-10.954,12.67-16.442    c0.263-0.347,0.538-0.718,0.717-1.106c0.269-0.586,0.299-1.196-0.335-1.776c-0.825-0.753-1.8-0.15-2.595,0.419    c-0.67,0.472-1.333,0.957-1.955,1.489c-2.206,1.889-4.401,3.797-6.595,5.698c-3.958,3.438-7.922,6.876-11.976,10.194    c-2.443,2.003-4.865,4.028-7.301,6.038c-18.689-10.581-39.53-15.906-62.549-15.906c-35.54,0-65.911,12.607-91.125,37.82    c-25.214,25.215-37.821,55.592-37.821,91.126c0,35.54,12.607,65.91,37.821,91.125c4.146,4.146,8.445,7.916,12.87,11.381    c-9.015,11.14-18.036,22.277-27.034,33.429c-1.208,1.489-3.755,3.151-2.745,4.891c0.078,0.144,0.173,0.281,0.305,0.425    c1.321,1.429,3.492-1.303,4.933-2.457c6.673-5.333,13.333-10.685,19.982-16.042c3.707-2.984,7.417-5.965,11.124-8.952    c1.474-1.188,2.951-2.373,4.425-3.561c6.41-5.164,12.816-10.333,19.238-15.481L854.024,1585.195z M797.552,1498.009    c0-26.243,9.29-48.728,27.868-67.459c18.579-18.723,40.987-28.089,67.238-28.089c12.273,0,23.712,2.075,34.34,6.171    c-3.37,2.905-6.734,5.816-10.069,8.762c-6.075,5.351-12.365,10.469-18.667,15.564c-4.179,3.378-8.371,6.744-12.514,10.164    c-7.54,6.23-15.037,12.52-22.529,18.804c-7.091,5.955-14.182,11.904-21.19,17.949c-1.136,0.974-3.055,1.907-2.135,3.94    c0.831,1.836,2.774,1.417,4.341,1.578l12.145-0.599l14.151-0.698c1.031-0.102,2.192-0.257,2.89,0.632    c0.034,0.044,0.073,0.078,0.106,0.127c1.017,1.561-0.67,2.105-1.387,2.942c-6.308,7.318-12.616,14.637-18.978,21.907    c-8.161,9.339-16.353,18.649-24.544,27.958c-2.146,2.433-4.275,4.879-6.422,7.312c-1.034,1.172-2.129,2.272-1.238,3.922    c0.933,1.728,2.685,1.752,4.323,1.602c4.134-0.367,8.263-0.489,12.396-0.492c0.242,0,0.485-0.005,0.728-0.004    c2.711,0.009,5.422,0.068,8.134,0.145c2.582,0.074,5.166,0.165,7.752,0.249c0.275,1.62-0.879,2.356-1.62,3.259    c-1.333,1.626-2.667,3.247-4,4.867c-4.315,5.252-8.62,10.514-12.928,15.772c-3.562-2.725-7.007-5.733-10.324-9.051    C806.842,1546.667,797.552,1524.26,797.552,1498.009z"></path>
            </svg>
          </div>
          <h2 class="mt-6 text-xl font-medium text-white">Welcome Back</h2>
          <p class="mt-2 text-sm text-zinc-400">Sign in to your account to continue</p>
        </div>

        <!-- Form Container -->
        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="bg-zinc-900 shadow-sm ring-1 ring-white/10 rounded-xl px-6 py-8 sm:px-10">
            <!-- Alerts -->
            ${data.error ? `<div class="mb-6">${renderAlert({ type: "error", message: data.error })}</div>` : ""}
            ${data.message ? `<div class="mb-6">${renderAlert({ type: "success", message: data.message })}</div>` : ""}

            <!-- Form Response (HTMX target) -->
            <div id="form-response" class="mb-6"></div>

            <!-- Form -->
            <form
              id="login-form"
              hx-post="/auth/login/form"
              hx-target="#form-response"
              hx-swap="innerHTML"
              class="space-y-6"
            >
              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
                  placeholder="Enter your email"
                >
              </div>

              <!-- Password -->
              <div>
                <label for="password" class="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
                  placeholder="Enter your password"
                >
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors"
              >
                Sign In
              </button>
            </form>

            <!-- Links -->
            <div class="mt-6 text-center">
              <p class="text-sm text-zinc-400">
                Don't have an account?
                <a href="/auth/register" class="font-semibold text-white hover:text-zinc-300 transition-colors">Create one here</a>
              </p>
            </div>
          </div>

          <!-- Version -->
          <div class="mt-6 text-center">
            <span class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-cyan-500/10 text-cyan-400 ring-1 ring-inset ring-cyan-500/20">
              v${data.version || "0.1.0"}
            </span>
          </div>
        </div>
      </div>

      ${demoLoginActive ? `
      <script>
        // Demo Login Prefill Script
        (function() {
          'use strict';

          function prefillLoginForm() {
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (emailInput && passwordInput) {
              emailInput.value = 'admin@sonicjs.com';
              passwordInput.value = 'admin123';

              // Add visual indication that form is prefilled (only if not already present)
              const form = emailInput.closest('form');
              if (form && !form.querySelector('.demo-mode-notice')) {
                const notice = document.createElement('div');
                notice.className = 'demo-mode-notice mb-6 rounded-lg bg-blue-500/10 p-4 ring-1 ring-blue-500/20';
                notice.innerHTML = '<div class="flex items-start gap-x-3"><svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><div><h3 class="text-sm font-semibold text-blue-300">Demo Mode</h3><p class="mt-1 text-sm text-blue-400">Login form prefilled with demo credentials</p></div></div>';
                form.insertBefore(notice, form.firstChild);
              }
            }
          }

          // Prefill on page load
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', prefillLoginForm);
          } else {
            prefillLoginForm();
          }

          // Also handle HTMX page changes (for SPA-like navigation)
          document.addEventListener('htmx:afterSwap', function(event) {
            if (event.detail.target.id === 'main-content' ||
                document.getElementById('email')) {
              setTimeout(prefillLoginForm, 100);
            }
          });
        })();
      </script>
      ` : ""}
    </body>
    </html>
  `;
}

// src/templates/pages/auth-register.template.ts
function renderRegisterPage(data) {
  return `
    <!DOCTYPE html>
    <html lang="en" class="h-full dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Register - SonicJS AI</title>
      <link rel="icon" type="image/x-icon" href="https://demo.sonicjs.com/images/favicon.ico">
      <script src="https://unpkg.com/htmx.org@2.0.3"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {}
          }
        }
      </script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      </style>
    </head>
    <body class="h-full bg-zinc-950">
      <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <!-- Logo Section -->
        <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white">
            <svg class="h-7 w-7 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="mt-6 text-3xl font-semibold tracking-tight text-white">SonicJS AI</h1>
          <p class="mt-2 text-sm text-zinc-400">Create your account and get started</p>
        </div>

        <!-- Form Container -->
        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="bg-zinc-900 shadow-sm ring-1 ring-white/10 rounded-xl px-6 py-8 sm:px-10">
            <!-- Alerts -->
            ${data.error ? `<div class="mb-6">${renderAlert({ type: "error", message: data.error })}</div>` : ""}

            <!-- Form -->
            <form
              id="register-form"
              hx-post="/auth/register/form"
              hx-target="#form-response"
              hx-swap="innerHTML"
              class="space-y-6"
            >
              <!-- First and Last Name -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-white mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
                    placeholder="First name"
                  >
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-white mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
                    placeholder="Last name"
                  >
                </div>
              </div>

              <!-- Username -->
              <div>
                <label for="username" class="block text-sm font-medium text-white mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
                  placeholder="Choose a username"
                >
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
                  placeholder="Enter your email"
                >
              </div>

              <!-- Password -->
              <div>
                <label for="password" class="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="new-password"
                  required
                  minlength="8"
                  class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
                  placeholder="Create a password (min. 8 characters)"
                >
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors"
              >
                Create Account
              </button>
            </form>

            <!-- Links -->
            <div class="mt-6 text-center">
              <p class="text-sm text-zinc-400">
                Already have an account?
                <a href="/auth/login" class="font-semibold text-white hover:text-zinc-300 transition-colors">Sign in here</a>
              </p>
            </div>

            <div id="form-response"></div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
var AuthValidationService = class _AuthValidationService {
  static instance;
  cachedSettings = null;
  cacheExpiry = 0;
  CACHE_TTL = 5 * 60 * 1e3;
  // 5 minutes
  static getInstance() {
    if (!_AuthValidationService.instance) {
      _AuthValidationService.instance = new _AuthValidationService();
    }
    return _AuthValidationService.instance;
  }
  /**
   * Get authentication settings from core-auth plugin
   */
  async getAuthSettings(db) {
    if (this.cachedSettings && Date.now() < this.cacheExpiry) {
      return this.cachedSettings;
    }
    try {
      const plugin = await db.prepare("SELECT settings FROM plugins WHERE id = ? AND status = ?").bind("core-auth", "active").first();
      if (!plugin || !plugin.settings) {
        console.warn("[AuthValidation] Core-auth plugin not found or not active, using defaults");
        return this.getDefaultSettings();
      }
      const settings = typeof plugin.settings === "string" ? JSON.parse(plugin.settings) : plugin.settings;
      this.cachedSettings = settings;
      this.cacheExpiry = Date.now() + this.CACHE_TTL;
      return settings;
    } catch (error) {
      console.error("[AuthValidation] Error loading auth settings:", error);
      return this.getDefaultSettings();
    }
  }
  /**
   * Get default authentication settings
   */
  getDefaultSettings() {
    return {
      requiredFields: {
        email: { required: true, minLength: 5, label: "Email", type: "email" },
        password: { required: true, minLength: 8, label: "Password", type: "password" },
        username: { required: true, minLength: 3, label: "Username", type: "text" },
        firstName: { required: true, minLength: 1, label: "First Name", type: "text" },
        lastName: { required: true, minLength: 1, label: "Last Name", type: "text" }
      },
      validation: {
        emailFormat: true,
        allowDuplicateUsernames: false,
        passwordRequirements: {
          requireUppercase: false,
          requireLowercase: false,
          requireNumbers: false,
          requireSpecialChars: false
        }
      },
      registration: {
        enabled: true,
        requireEmailVerification: false,
        defaultRole: "viewer"
      }
    };
  }
  /**
   * Build dynamic Zod schema based on settings
   */
  async buildRegistrationSchema(db) {
    const settings = await this.getAuthSettings(db);
    const fields = settings.requiredFields;
    const validation = settings.validation;
    const schemaFields = {};
    if (fields.email.required) {
      let emailSchema = zod.z.string();
      if (validation.emailFormat) {
        emailSchema = emailSchema.email("Valid email is required");
      }
      if (fields.email.minLength > 0) {
        emailSchema = emailSchema.min(
          fields.email.minLength,
          `Email must be at least ${fields.email.minLength} characters`
        );
      }
      schemaFields.email = emailSchema;
    } else {
      schemaFields.email = zod.z.string().email().optional();
    }
    if (fields.password.required) {
      let passwordSchema = zod.z.string().min(
        fields.password.minLength,
        `Password must be at least ${fields.password.minLength} characters`
      );
      if (validation.passwordRequirements.requireUppercase) {
        passwordSchema = passwordSchema.regex(
          /[A-Z]/,
          "Password must contain at least one uppercase letter"
        );
      }
      if (validation.passwordRequirements.requireLowercase) {
        passwordSchema = passwordSchema.regex(
          /[a-z]/,
          "Password must contain at least one lowercase letter"
        );
      }
      if (validation.passwordRequirements.requireNumbers) {
        passwordSchema = passwordSchema.regex(
          /[0-9]/,
          "Password must contain at least one number"
        );
      }
      if (validation.passwordRequirements.requireSpecialChars) {
        passwordSchema = passwordSchema.regex(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        );
      }
      schemaFields.password = passwordSchema;
    } else {
      schemaFields.password = zod.z.string().min(fields.password.minLength).optional();
    }
    if (fields.username.required) {
      schemaFields.username = zod.z.string().min(
        fields.username.minLength,
        `Username must be at least ${fields.username.minLength} characters`
      );
    } else {
      schemaFields.username = zod.z.string().min(fields.username.minLength).optional();
    }
    if (fields.firstName.required) {
      schemaFields.firstName = zod.z.string().min(
        fields.firstName.minLength,
        `First name must be at least ${fields.firstName.minLength} characters`
      );
    } else {
      schemaFields.firstName = zod.z.string().optional();
    }
    if (fields.lastName.required) {
      schemaFields.lastName = zod.z.string().min(
        fields.lastName.minLength,
        `Last name must be at least ${fields.lastName.minLength} characters`
      );
    } else {
      schemaFields.lastName = zod.z.string().optional();
    }
    return zod.z.object(schemaFields);
  }
  /**
   * Validate registration data against settings
   */
  async validateRegistration(db, data) {
    try {
      const schema = await this.buildRegistrationSchema(db);
      await schema.parseAsync(data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof zod.z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => e.message)
        };
      }
      return {
        valid: false,
        errors: ["Validation failed"]
      };
    }
  }
  /**
   * Clear cached settings (call after updating plugin settings)
   */
  clearCache() {
    this.cachedSettings = null;
    this.cacheExpiry = 0;
  }
  /**
   * Get required field names for database insertion
   */
  async getRequiredFieldNames(db) {
    const settings = await this.getAuthSettings(db);
    const requiredFields = [];
    Object.entries(settings.requiredFields).forEach(([key, config]) => {
      if (config.required) {
        requiredFields.push(key);
      }
    });
    return requiredFields;
  }
  /**
   * Generate auto-fill values for optional fields
   */
  generateDefaultValue(fieldName, data) {
    switch (fieldName) {
      case "username":
        return data.email ? data.email.split("@")[0] : `user_${Date.now()}`;
      case "firstName":
        return data.firstName || "User";
      case "lastName":
        return data.lastName || "";
      default:
        return "";
    }
  }
};
var authValidationService = AuthValidationService.getInstance();

// src/routes/auth.ts
var authRoutes = new hono.Hono();
authRoutes.get("/login", async (c) => {
  const error = c.req.query("error");
  const message = c.req.query("message");
  const pageData = {
    error: error || void 0,
    message: message || void 0,
    version: c.get("appVersion")
  };
  const db = c.env.DB;
  let demoLoginActive = false;
  try {
    const plugin = await db.prepare("SELECT * FROM plugins WHERE id = ? AND status = ?").bind("demo-login-prefill", "active").first();
    demoLoginActive = !!plugin;
  } catch (error2) {
  }
  return c.html(renderLoginPage(pageData, demoLoginActive));
});
authRoutes.get("/register", (c) => {
  const error = c.req.query("error");
  const pageData = {
    error: error || void 0
  };
  return c.html(renderRegisterPage(pageData));
});
var loginSchema = zod.z.object({
  email: zod.z.string().email("Valid email is required"),
  password: zod.z.string().min(1, "Password is required")
});
authRoutes.post(
  "/register",
  async (c) => {
    try {
      const db = c.env.DB;
      const requestData = await c.req.json();
      const validationSchema = await authValidationService.buildRegistrationSchema(db);
      const validationResult = await validationSchema.safeParseAsync(requestData);
      if (!validationResult.success) {
        return c.json({
          error: "Validation failed",
          details: validationResult.error.errors.map((e) => e.message)
        }, 400);
      }
      const validatedData = validationResult.data;
      const email = validatedData.email;
      const password = validatedData.password;
      const username = validatedData.username || authValidationService.generateDefaultValue("username", validatedData);
      const firstName = validatedData.firstName || authValidationService.generateDefaultValue("firstName", validatedData);
      const lastName = validatedData.lastName || authValidationService.generateDefaultValue("lastName", validatedData);
      const normalizedEmail = email.toLowerCase();
      const existingUser = await db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").bind(normalizedEmail, username).first();
      if (existingUser) {
        return c.json({ error: "User with this email or username already exists" }, 400);
      }
      const passwordHash = await chunk24PWAFUT_cjs.AuthManager.hashPassword(password);
      const userId = crypto.randomUUID();
      const now = /* @__PURE__ */ new Date();
      await db.prepare(`
        INSERT INTO users (id, email, username, first_name, last_name, password_hash, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        normalizedEmail,
        username,
        firstName,
        lastName,
        passwordHash,
        "viewer",
        // Default role
        1,
        // is_active
        now.getTime(),
        now.getTime()
      ).run();
      const token = await chunk24PWAFUT_cjs.AuthManager.generateToken(userId, normalizedEmail, "viewer");
      cookie.setCookie(c, "auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 60 * 60 * 24
        // 24 hours
      });
      return c.json({
        user: {
          id: userId,
          email: normalizedEmail,
          username,
          firstName,
          lastName,
          role: "viewer"
        },
        token
      }, 201);
    } catch (error) {
      console.error("Registration error:", error);
      return c.json({ error: "Registration failed" }, 500);
    }
  }
);
authRoutes.post(
  "/login",
  zValidator("json", loginSchema),
  async (c) => {
    try {
      const { email, password } = c.req.valid("json");
      const db = c.env.DB;
      const normalizedEmail = email.toLowerCase();
      const cache = chunkK6ZR653V_cjs.getCacheService(chunkK6ZR653V_cjs.CACHE_CONFIGS.user);
      let user = await cache.get(cache.generateKey("user", `email:${normalizedEmail}`));
      if (!user) {
        user = await db.prepare("SELECT * FROM users WHERE email = ? AND is_active = 1").bind(normalizedEmail).first();
        if (user) {
          await cache.set(cache.generateKey("user", `email:${normalizedEmail}`), user);
          await cache.set(cache.generateKey("user", user.id), user);
        }
      }
      if (!user) {
        return c.json({ error: "Invalid email or password" }, 401);
      }
      const isValidPassword = await chunk24PWAFUT_cjs.AuthManager.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return c.json({ error: "Invalid email or password" }, 401);
      }
      const token = await chunk24PWAFUT_cjs.AuthManager.generateToken(user.id, user.email, user.role);
      cookie.setCookie(c, "auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 60 * 60 * 24
        // 24 hours
      });
      await db.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").bind((/* @__PURE__ */ new Date()).getTime(), user.id).run();
      await cache.delete(cache.generateKey("user", user.id));
      await cache.delete(cache.generateKey("user", `email:${normalizedEmail}`));
      return c.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      return c.json({ error: "Login failed" }, 500);
    }
  }
);
authRoutes.post("/logout", (c) => {
  cookie.setCookie(c, "auth_token", "", {
    httpOnly: true,
    secure: false,
    // Set to true in production with HTTPS
    sameSite: "Strict",
    maxAge: 0
    // Expire immediately
  });
  return c.json({ message: "Logged out successfully" });
});
authRoutes.get("/logout", (c) => {
  cookie.setCookie(c, "auth_token", "", {
    httpOnly: true,
    secure: false,
    // Set to true in production with HTTPS
    sameSite: "Strict",
    maxAge: 0
    // Expire immediately
  });
  return c.redirect("/auth/login?message=You have been logged out successfully");
});
authRoutes.get("/me", chunk24PWAFUT_cjs.requireAuth(), async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Not authenticated" }, 401);
    }
    const db = c.env.DB;
    const userData = await db.prepare("SELECT id, email, username, first_name, last_name, role, created_at FROM users WHERE id = ?").bind(user.userId).first();
    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json({ user: userData });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ error: "Failed to get user" }, 500);
  }
});
authRoutes.post("/refresh", chunk24PWAFUT_cjs.requireAuth(), async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Not authenticated" }, 401);
    }
    const token = await chunk24PWAFUT_cjs.AuthManager.generateToken(user.userId, user.email, user.role);
    cookie.setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 24
      // 24 hours
    });
    return c.json({ token });
  } catch (error) {
    console.error("Token refresh error:", error);
    return c.json({ error: "Token refresh failed" }, 500);
  }
});
authRoutes.post("/register/form", async (c) => {
  try {
    const db = c.env.DB;
    const formData = await c.req.formData();
    const requestData = {
      email: formData.get("email"),
      password: formData.get("password"),
      username: formData.get("username"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName")
    };
    const normalizedEmail = requestData.email?.toLowerCase();
    requestData.email = normalizedEmail;
    const validationSchema = await authValidationService.buildRegistrationSchema(db);
    const validation = await validationSchema.safeParseAsync(requestData);
    if (!validation.success) {
      return c.html(html.html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ${validation.error.errors.map((err) => err.message).join(", ")}
        </div>
      `);
    }
    const validatedData = validation.data;
    const email = validatedData.email;
    const password = validatedData.password;
    const username = validatedData.username || authValidationService.generateDefaultValue("username", validatedData);
    const firstName = validatedData.firstName || authValidationService.generateDefaultValue("firstName", validatedData);
    const lastName = validatedData.lastName || authValidationService.generateDefaultValue("lastName", validatedData);
    const existingUser = await db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").bind(normalizedEmail, username).first();
    if (existingUser) {
      return c.html(html.html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          User with this email or username already exists
        </div>
      `);
    }
    const passwordHash = await chunk24PWAFUT_cjs.AuthManager.hashPassword(password);
    const userId = crypto.randomUUID();
    const now = /* @__PURE__ */ new Date();
    await db.prepare(`
      INSERT INTO users (id, email, username, first_name, last_name, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      normalizedEmail,
      username,
      firstName,
      lastName,
      passwordHash,
      "admin",
      // First user gets admin role
      1,
      // is_active
      now.getTime(),
      now.getTime()
    ).run();
    const token = await chunk24PWAFUT_cjs.AuthManager.generateToken(userId, normalizedEmail, "admin");
    cookie.setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: false,
      // Set to true in production with HTTPS
      sameSite: "Strict",
      maxAge: 60 * 60 * 24
      // 24 hours
    });
    return c.html(html.html`
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        Account created successfully! Redirecting to admin dashboard...
        <script>
          setTimeout(() => {
            window.location.href = '/admin';
          }, 2000);
        </script>
      </div>
    `);
  } catch (error) {
    console.error("Registration error:", error);
    return c.html(html.html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Registration failed. Please try again.
      </div>
    `);
  }
});
authRoutes.post("/login/form", async (c) => {
  try {
    const formData = await c.req.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const normalizedEmail = email.toLowerCase();
    const validation = loginSchema.safeParse({ email: normalizedEmail, password });
    if (!validation.success) {
      return c.html(html.html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ${validation.error.errors.map((err) => err.message).join(", ")}
        </div>
      `);
    }
    const db = c.env.DB;
    const user = await db.prepare("SELECT * FROM users WHERE email = ? AND is_active = 1").bind(normalizedEmail).first();
    if (!user) {
      return c.html(html.html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Invalid email or password
        </div>
      `);
    }
    const isValidPassword = await chunk24PWAFUT_cjs.AuthManager.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.html(html.html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Invalid email or password
        </div>
      `);
    }
    const token = await chunk24PWAFUT_cjs.AuthManager.generateToken(user.id, user.email, user.role);
    cookie.setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: false,
      // Set to true in production with HTTPS
      sameSite: "Strict",
      maxAge: 60 * 60 * 24
      // 24 hours
    });
    await db.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").bind((/* @__PURE__ */ new Date()).getTime(), user.id).run();
    return c.html(html.html`
      <div id="form-response">
        <div class="rounded-lg bg-green-100 dark:bg-lime-500/10 p-4 ring-1 ring-green-400 dark:ring-lime-500/20">
          <div class="flex items-start gap-x-3">
            <svg class="h-5 w-5 text-green-600 dark:text-lime-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium text-green-700 dark:text-lime-300">Login successful! Redirecting to admin dashboard...</p>
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.location.href = '/admin';
            }, 2000);
          </script>
        </div>
      </div>
    `);
  } catch (error) {
    console.error("Login error:", error);
    return c.html(html.html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Login failed. Please try again.
      </div>
    `);
  }
});
authRoutes.post("/seed-admin", async (c) => {
  try {
    const db = c.env.DB;
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        password_hash TEXT,
        role TEXT NOT NULL DEFAULT 'viewer',
        avatar TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_login_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `).run();
    const existingAdmin = await db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").bind("admin@sonicjs.com", "admin").first();
    if (existingAdmin) {
      return c.json({
        message: "Admin user already exists",
        user: {
          id: existingAdmin.id,
          email: "admin@sonicjs.com",
          username: "admin",
          role: "admin"
        }
      });
    }
    const passwordHash = await chunk24PWAFUT_cjs.AuthManager.hashPassword("admin123");
    const userId = "admin-user-id";
    const now = Date.now();
    const adminEmail = "admin@sonicjs.com".toLowerCase();
    await db.prepare(`
      INSERT INTO users (id, email, username, first_name, last_name, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      adminEmail,
      "admin",
      "Admin",
      "User",
      passwordHash,
      "admin",
      1,
      // is_active
      now,
      now
    ).run();
    return c.json({
      message: "Admin user created successfully",
      user: {
        id: userId,
        email: adminEmail,
        username: "admin",
        role: "admin"
      },
      passwordHash
      // For debugging
    });
  } catch (error) {
    console.error("Seed admin error:", error);
    return c.json({ error: "Failed to create admin user", details: error instanceof Error ? error.message : String(error) }, 500);
  }
});
authRoutes.get("/accept-invitation", async (c) => {
  try {
    const token = c.req.query("token");
    if (!token) {
      return c.html(`
        <html>
          <head><title>Invalid Invitation</title></head>
          <body>
            <h1>Invalid Invitation</h1>
            <p>The invitation link is invalid or has expired.</p>
            <a href="/auth/login">Go to Login</a>
          </body>
        </html>
      `);
    }
    const db = c.env.DB;
    const userStmt = db.prepare(`
      SELECT id, email, first_name, last_name, role, invited_at
      FROM users 
      WHERE invitation_token = ? AND is_active = 0
    `);
    const invitedUser = await userStmt.bind(token).first();
    if (!invitedUser) {
      return c.html(`
        <html>
          <head><title>Invalid Invitation</title></head>
          <body>
            <h1>Invalid Invitation</h1>
            <p>The invitation link is invalid or has expired.</p>
            <a href="/auth/login">Go to Login</a>
          </body>
        </html>
      `);
    }
    const invitationAge = Date.now() - invitedUser.invited_at;
    const maxAge = 7 * 24 * 60 * 60 * 1e3;
    if (invitationAge > maxAge) {
      return c.html(`
        <html>
          <head><title>Invitation Expired</title></head>
          <body>
            <h1>Invitation Expired</h1>
            <p>This invitation has expired. Please contact your administrator for a new invitation.</p>
            <a href="/auth/login">Go to Login</a>
          </body>
        </html>
      `);
    }
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Accept Invitation - SonicJS AI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            min-height: 100vh;
          }
        </style>
      </head>
      <body class="bg-gray-900 text-white">
        <div class="min-h-screen flex items-center justify-center px-4">
          <div class="max-w-md w-full space-y-8">
            <div class="text-center">
              <div class="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
              </div>
              <h2 class="text-3xl font-bold">Accept Invitation</h2>
              <p class="mt-2 text-gray-400">Complete your account setup</p>
              <p class="mt-4 text-sm">
                You've been invited as <strong>${invitedUser.first_name} ${invitedUser.last_name}</strong><br>
                <span class="text-gray-400">${invitedUser.email}</span><br>
                <span class="text-blue-400 capitalize">${invitedUser.role}</span>
              </p>
            </div>

            <form method="POST" action="/auth/accept-invitation" class="mt-8 space-y-6">
              <input type="hidden" name="token" value="${token}" />
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input 
                  type="text" 
                  name="username" 
                  required
                  class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter your username"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  required
                  minlength="8"
                  class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter your password"
                >
                <p class="text-xs text-gray-400 mt-1">Password must be at least 8 characters long</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  name="confirm_password" 
                  required
                  minlength="8"
                  class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Confirm your password"
                >
              </div>

              <button 
                type="submit"
                class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
              >
                Accept Invitation & Create Account
              </button>
            </form>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Accept invitation page error:", error);
    return c.html(`
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Error</h1>
          <p>An error occurred while processing your invitation.</p>
          <a href="/auth/login">Go to Login</a>
        </body>
      </html>
    `);
  }
});
authRoutes.post("/accept-invitation", async (c) => {
  try {
    const formData = await c.req.formData();
    const token = formData.get("token")?.toString();
    const username = formData.get("username")?.toString()?.trim();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirm_password")?.toString();
    if (!token || !username || !password || !confirmPassword) {
      return c.json({ error: "All fields are required" }, 400);
    }
    if (password !== confirmPassword) {
      return c.json({ error: "Passwords do not match" }, 400);
    }
    if (password.length < 8) {
      return c.json({ error: "Password must be at least 8 characters long" }, 400);
    }
    const db = c.env.DB;
    const userStmt = db.prepare(`
      SELECT id, email, first_name, last_name, role, invited_at
      FROM users 
      WHERE invitation_token = ? AND is_active = 0
    `);
    const invitedUser = await userStmt.bind(token).first();
    if (!invitedUser) {
      return c.json({ error: "Invalid or expired invitation" }, 400);
    }
    const invitationAge = Date.now() - invitedUser.invited_at;
    const maxAge = 7 * 24 * 60 * 60 * 1e3;
    if (invitationAge > maxAge) {
      return c.json({ error: "Invitation has expired" }, 400);
    }
    const existingUsernameStmt = db.prepare(`
      SELECT id FROM users WHERE username = ? AND id != ?
    `);
    const existingUsername = await existingUsernameStmt.bind(username, invitedUser.id).first();
    if (existingUsername) {
      return c.json({ error: "Username is already taken" }, 400);
    }
    const passwordHash = await chunk24PWAFUT_cjs.AuthManager.hashPassword(password);
    const updateStmt = db.prepare(`
      UPDATE users SET 
        username = ?,
        password_hash = ?,
        is_active = 1,
        email_verified = 1,
        invitation_token = NULL,
        accepted_invitation_at = ?,
        updated_at = ?
      WHERE id = ?
    `);
    await updateStmt.bind(
      username,
      passwordHash,
      Date.now(),
      Date.now(),
      invitedUser.id
    ).run();
    const authToken = await chunk24PWAFUT_cjs.AuthManager.generateToken(invitedUser.id, invitedUser.email, invitedUser.role);
    cookie.setCookie(c, "auth_token", authToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 24
      // 24 hours
    });
    return c.redirect("/admin?welcome=true");
  } catch (error) {
    console.error("Accept invitation error:", error);
    return c.json({ error: "Failed to accept invitation" }, 500);
  }
});
authRoutes.post("/request-password-reset", async (c) => {
  try {
    const formData = await c.req.formData();
    const email = formData.get("email")?.toString()?.trim()?.toLowerCase();
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Please enter a valid email address" }, 400);
    }
    const db = c.env.DB;
    const userStmt = db.prepare(`
      SELECT id, email, first_name, last_name FROM users 
      WHERE email = ? AND is_active = 1
    `);
    const user = await userStmt.bind(email).first();
    if (!user) {
      return c.json({
        success: true,
        message: "If an account with this email exists, a password reset link has been sent."
      });
    }
    const resetToken = crypto.randomUUID();
    const resetExpires = Date.now() + 60 * 60 * 1e3;
    const updateStmt = db.prepare(`
      UPDATE users SET 
        password_reset_token = ?,
        password_reset_expires = ?,
        updated_at = ?
      WHERE id = ?
    `);
    await updateStmt.bind(
      resetToken,
      resetExpires,
      Date.now(),
      user.id
    ).run();
    const resetLink = `${c.req.header("origin") || "http://localhost:8787"}/auth/reset-password?token=${resetToken}`;
    return c.json({
      success: true,
      message: "If an account with this email exists, a password reset link has been sent.",
      reset_link: resetLink
      // In production, this would be sent via email
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return c.json({ error: "Failed to process password reset request" }, 500);
  }
});
authRoutes.get("/reset-password", async (c) => {
  try {
    const token = c.req.query("token");
    if (!token) {
      return c.html(`
        <html>
          <head><title>Invalid Reset Link</title></head>
          <body>
            <h1>Invalid Reset Link</h1>
            <p>The password reset link is invalid or has expired.</p>
            <a href="/auth/login">Go to Login</a>
          </body>
        </html>
      `);
    }
    const db = c.env.DB;
    const userStmt = db.prepare(`
      SELECT id, email, first_name, last_name, password_reset_expires
      FROM users 
      WHERE password_reset_token = ? AND is_active = 1
    `);
    const user = await userStmt.bind(token).first();
    if (!user) {
      return c.html(`
        <html>
          <head><title>Invalid Reset Link</title></head>
          <body>
            <h1>Invalid Reset Link</h1>
            <p>The password reset link is invalid or has already been used.</p>
            <a href="/auth/login">Go to Login</a>
          </body>
        </html>
      `);
    }
    if (Date.now() > user.password_reset_expires) {
      return c.html(`
        <html>
          <head><title>Reset Link Expired</title></head>
          <body>
            <h1>Reset Link Expired</h1>
            <p>The password reset link has expired. Please request a new one.</p>
            <a href="/auth/login">Go to Login</a>
          </body>
        </html>
      `);
    }
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - SonicJS AI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            min-height: 100vh;
          }
        </style>
      </head>
      <body class="bg-gray-900 text-white">
        <div class="min-h-screen flex items-center justify-center px-4">
          <div class="max-w-md w-full space-y-8">
            <div class="text-center">
              <div class="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0119 9z"/>
                </svg>
              </div>
              <h2 class="text-3xl font-bold">Reset Password</h2>
              <p class="mt-2 text-gray-400">Choose a new password for your account</p>
              <p class="mt-4 text-sm">
                Reset password for <strong>${user.first_name} ${user.last_name}</strong><br>
                <span class="text-gray-400">${user.email}</span>
              </p>
            </div>

            <form method="POST" action="/auth/reset-password" class="mt-8 space-y-6">
              <input type="hidden" name="token" value="${token}" />
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <input 
                  type="password" 
                  name="password" 
                  required
                  minlength="8"
                  class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter your new password"
                >
                <p class="text-xs text-gray-400 mt-1">Password must be at least 8 characters long</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirm_password" 
                  required
                  minlength="8"
                  class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Confirm your new password"
                >
              </div>

              <button 
                type="submit"
                class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all"
              >
                Reset Password
              </button>
            </form>

            <div class="text-center">
              <a href="/auth/login" class="text-sm text-blue-400 hover:text-blue-300">
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Password reset page error:", error);
    return c.html(`
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Error</h1>
          <p>An error occurred while processing your password reset.</p>
          <a href="/auth/login">Go to Login</a>
        </body>
      </html>
    `);
  }
});
authRoutes.post("/reset-password", async (c) => {
  try {
    const formData = await c.req.formData();
    const token = formData.get("token")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirm_password")?.toString();
    if (!token || !password || !confirmPassword) {
      return c.json({ error: "All fields are required" }, 400);
    }
    if (password !== confirmPassword) {
      return c.json({ error: "Passwords do not match" }, 400);
    }
    if (password.length < 8) {
      return c.json({ error: "Password must be at least 8 characters long" }, 400);
    }
    const db = c.env.DB;
    const userStmt = db.prepare(`
      SELECT id, email, password_hash, password_reset_expires
      FROM users
      WHERE password_reset_token = ? AND is_active = 1
    `);
    const user = await userStmt.bind(token).first();
    if (!user) {
      return c.json({ error: "Invalid or expired reset token" }, 400);
    }
    if (Date.now() > user.password_reset_expires) {
      return c.json({ error: "Reset token has expired" }, 400);
    }
    const newPasswordHash = await chunk24PWAFUT_cjs.AuthManager.hashPassword(password);
    try {
      const historyStmt = db.prepare(`
        INSERT INTO password_history (id, user_id, password_hash, created_at)
        VALUES (?, ?, ?, ?)
      `);
      await historyStmt.bind(
        crypto.randomUUID(),
        user.id,
        user.password_hash,
        Date.now()
      ).run();
    } catch (historyError) {
      console.warn("Could not store password history:", historyError);
    }
    const updateStmt = db.prepare(`
      UPDATE users SET
        password_hash = ?,
        password_reset_token = NULL,
        password_reset_expires = NULL,
        updated_at = ?
      WHERE id = ?
    `);
    await updateStmt.bind(
      newPasswordHash,
      Date.now(),
      user.id
    ).run();
    return c.redirect("/auth/login?message=Password reset successfully. Please log in with your new password.");
  } catch (error) {
    console.error("Password reset error:", error);
    return c.json({ error: "Failed to reset password" }, 500);
  }
});
var auth_default = authRoutes;

// src/routes/index.ts
var ROUTES_INFO = {
  message: "Routes migration in progress",
  available: [
    "apiRoutes",
    "apiContentCrudRoutes",
    "apiMediaRoutes",
    "apiSystemRoutes",
    "adminApiRoutes",
    "authRoutes"
  ],
  status: "Routes are being added incrementally",
  reference: "https://github.com/sonicjs/sonicjs"
};

exports.ROUTES_INFO = ROUTES_INFO;
exports.admin_api_default = admin_api_default;
exports.api_content_crud_default = api_content_crud_default;
exports.api_default = api_default;
exports.api_media_default = api_media_default;
exports.api_system_default = api_system_default;
exports.auth_default = auth_default;
//# sourceMappingURL=chunk-PCFNAPA4.cjs.map
//# sourceMappingURL=chunk-PCFNAPA4.cjs.map