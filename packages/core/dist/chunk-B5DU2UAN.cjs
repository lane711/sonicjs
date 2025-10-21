'use strict';

var chunkAGOE25LF_cjs = require('./chunk-AGOE25LF.cjs');
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
    const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.api);
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
    const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.api);
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
    const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.api);
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
    const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.api);
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
    const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.api);
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
    const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.api);
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
      const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.user);
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

// src/templates/components/logo.template.ts
var sizeClasses = {
  sm: "h-6 w-auto",
  md: "h-8 w-auto",
  lg: "h-12 w-auto",
  xl: "h-16 w-auto"
};
function renderLogo(data = {}) {
  const {
    size = "md",
    variant = "default",
    showText = true,
    showVersion = true,
    version = "v0.1.0",
    className = "",
    href
  } = data;
  const sizeClass = sizeClasses[size];
  const logoSvg = `
    <svg class="${sizeClass} ${className}" viewBox="380 1300 2250 400" aria-hidden="true">
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M476.851,1404.673h168.536c4.714,0,8.695-1.618,11.944-4.866c3.241-3.241,4.866-7.222,4.866-11.943    c0-2.357-0.443-4.569-1.327-6.636c-0.885-2.06-2.067-3.829-3.539-5.308c-1.479-1.472-3.249-2.654-5.308-3.538    c-2.067-0.885-4.279-1.327-6.635-1.327H476.851c-20.057,0-37.158,7.154-51.313,21.454c-14.155,14.308-21.233,31.483-21.233,51.534    c0,20.058,7.078,37.234,21.233,51.534c14.155,14.308,31.255,21.454,51.313,21.454h112.357c10.907,0,20.196,3.837,27.868,11.502    c7.666,7.672,11.502,16.885,11.502,27.646c0,10.769-3.836,19.982-11.502,27.647c-7.672,7.673-16.961,11.502-27.868,11.502H421.115    c-4.721,0-8.702,1.624-11.944,4.865c-3.248,3.249-4.866,7.23-4.866,11.944c0,3.248,0.733,6.123,2.212,8.626    c1.472,2.509,3.462,4.499,5.971,5.972c2.502,1.472,5.378,2.212,8.626,2.212h168.094c20.052,0,37.227-7.078,51.534-21.234    c14.3-14.155,21.454-31.331,21.454-51.534c0-20.196-7.154-37.379-21.454-51.534c-14.308-14.156-31.483-21.234-51.534-21.234    H476.851c-10.616,0-19.76-3.905-27.426-11.721c-7.672-7.811-11.501-17.101-11.501-27.87c0-10.761,3.829-19.975,11.501-27.647    C457.091,1408.508,466.235,1404.673,476.851,1404.673z"></path>
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M974.78,1398.211c-5.016,6.574-10.034,13.146-15.048,19.721c-1.828,2.398-3.657,4.796-5.487,7.194    c1.994,1.719,3.958,3.51,5.873,5.424c18.724,18.731,28.089,41.216,28.089,67.459c0,26.251-9.366,48.658-28.089,67.237    c-18.731,18.579-41.215,27.868-67.459,27.868c-9.848,0-19.156-1.308-27.923-3.923l-4.185,3.354    c-8.587,6.885-17.154,13.796-25.725,20.702c17.52,8.967,36.86,13.487,58.054,13.487c35.533,0,65.91-12.608,91.124-37.821    c25.214-25.215,37.821-55.584,37.821-91.125c0-35.534-12.607-65.911-37.821-91.126    C981.004,1403.663,977.926,1400.854,974.78,1398.211z"></path>
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M1364.644,1439.619c-4.72,0-8.702,1.624-11.943,4.865c-3.249,3.249-4.866,7.23-4.866,11.944v138.014    l-167.651-211.003c-0.297-0.586-0.74-1.03-1.327-1.326c-4.721-4.714-10.249-7.742-16.588-9.069    c-6.346-1.326-12.608-0.732-18.801,1.77c-6.192,2.509-11.059,6.49-14.598,11.944c-3.539,5.46-5.308,11.577-5.308,18.357v208.348    c0,4.721,1.618,8.703,4.866,11.944c3.241,3.241,7.222,4.865,11.943,4.865c2.945,0,5.751-0.738,8.405-2.211    c2.654-1.472,4.713-3.463,6.193-5.971c1.473-2.503,2.212-5.378,2.212-8.627v-205.251l166.325,209.675    c2.06,2.654,4.423,4.865,7.078,6.635c5.308,3.829,11.349,5.75,18.137,5.75c5.308,0,10.464-1.182,15.482-3.538    c3.539-1.769,6.56-4.127,9.069-7.078c2.502-2.945,4.491-6.338,5.971-10.175c1.473-3.829,2.212-7.664,2.212-11.501v-141.552    c0-4.714-1.624-8.695-4.865-11.944C1373.339,1441.243,1369.359,1439.619,1364.644,1439.619z"></path>
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M1508.406,1432.983c-2.654-1.472-5.46-2.212-8.404-2.212c-4.721,0-8.703,1.7-11.944,5.087    c-3.249,3.395-4.865,7.3-4.865,11.723v163.228c0,4.721,1.616,8.702,4.865,11.943c3.241,3.249,7.223,4.866,11.944,4.866    c2.944,0,5.751-0.732,8.404-2.212c2.655-1.472,4.714-3.539,6.193-6.194c1.473-2.654,2.213-5.453,2.213-8.404V1447.58    c0-2.945-0.74-5.75-2.213-8.405C1513.12,1436.522,1511.06,1434.462,1508.406,1432.983z"></path>
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M1499.78,1367.957c-4.575,0-8.481,1.625-11.722,4.866c-3.249,3.249-4.865,7.23-4.865,11.943    c0,2.951,0.732,5.75,2.212,8.405c1.472,2.654,3.463,4.721,5.971,6.193c2.503,1.479,5.378,2.212,8.627,2.212    c4.423,0,8.328-1.618,11.721-4.865c3.387-3.243,5.088-7.224,5.088-11.944c0-4.713-1.701-8.694-5.088-11.943    C1508.33,1369.582,1504.349,1367.957,1499.78,1367.957z"></path>
      <path fill="${variant === "white" ? "#ffffff" : variant === "dark" ? "#1f2937" : "#F1F2F2"}" d="M1859.627,1369.727H1747.27c-35.388,0-65.69,12.607-90.904,37.821    c-25.213,25.215-37.82,55.591-37.82,91.125c0,35.54,12.607,65.911,37.82,91.125c25.215,25.215,55.516,37.821,90.904,37.821h56.178    c4.714,0,8.695-1.618,11.944-4.866c3.241-3.241,4.865-7.222,4.865-11.943c0-4.714-1.624-8.695-4.865-11.943    c-3.249-3.243-7.23-4.866-11.944-4.866h-56.178c-26.251,0-48.659-9.359-67.237-28.09c-18.579-18.723-27.868-41.207-27.868-67.459    c0-26.243,9.29-48.659,27.868-67.237c18.579-18.579,40.987-27.868,67.237-27.868h112.357c4.714,0,8.696-1.693,11.944-5.087    c3.241-3.387,4.865-7.368,4.865-11.943c0-4.569-1.624-8.475-4.865-11.723C1868.322,1371.351,1864.341,1369.727,1859.627,1369.727z    "></path>
      <path fill="#06b6d4" d="M2219.256,1371.054h-112.357c-4.423,0-8.336,1.624-11.723,4.865c-3.393,3.249-5.087,7.23-5.087,11.944    c0,4.721,1.694,8.702,5.087,11.943c3.387,3.249,7.3,4.866,11.723,4.866h95.547v95.105c0,26.251-9.365,48.659-28.088,67.237    c-18.731,18.579-41.215,27.868-67.459,27.868c-26.251,0-48.659-9.289-67.237-27.868c-18.579-18.579-27.868-40.987-27.868-67.237    c0-4.713-1.701-8.771-5.088-12.165c-3.393-3.387-7.374-5.087-11.943-5.087c-4.575,0-8.481,1.7-11.722,5.087    c-3.249,3.393-4.865,7.451-4.865,12.165c0,35.388,12.607,65.69,37.82,90.904c25.215,25.213,55.584,37.82,91.126,37.82    c35.532,0,65.91-12.607,91.125-37.82c25.214-25.215,37.82-55.516,37.82-90.904v-111.915c0-4.714-1.624-8.695-4.865-11.944    C2227.951,1372.678,2223.971,1371.054,2219.256,1371.054z"></path>
      <path fill="#06b6d4" d="M2574.24,1502.875c-14.306-14.156-31.483-21.234-51.533-21.234H2410.35    c-10.617,0-19.762-3.829-27.426-11.501c-7.672-7.664-11.501-16.954-11.501-27.868c0-10.907,3.829-20.196,11.501-27.868    c7.664-7.664,16.809-11.501,27.426-11.501h112.357c4.714,0,8.695-1.617,11.944-4.866c3.241-3.241,4.865-7.222,4.865-11.943    c0-4.714-1.624-8.695-4.865-11.944c-3.249-3.241-7.23-4.865-11.944-4.865H2410.35c-20.058,0-37.158,7.154-51.313,21.454    c-14.156,14.308-21.232,31.483-21.232,51.534c0,20.058,7.077,37.234,21.232,51.534c14.156,14.308,31.255,21.454,51.313,21.454    h112.357c7.078,0,13.637,1.77,19.684,5.308c6.042,3.539,10.838,8.336,14.377,14.377c3.538,6.047,5.307,12.607,5.307,19.685    c0,10.616-3.835,19.76-11.501,27.425c-7.672,7.673-16.961,11.502-27.868,11.502h-168.094c-4.721,0-8.703,1.7-11.944,5.087    c-3.249,3.393-4.865,7.374-4.865,11.943c0,4.576,1.616,8.481,4.865,11.723c3.241,3.249,7.223,4.866,11.944,4.866h168.094    c20.051,0,37.227-7.078,51.533-21.234c14.302-14.155,21.454-31.331,21.454-51.534    C2595.695,1534.213,2588.542,1517.03,2574.24,1502.875z"></path>
      <path fill="#06b6d4" d="M854.024,1585.195l20.001-16.028c16.616-13.507,33.04-27.265,50.086-40.251    c1.13-0.861,2.9-1.686,2.003-3.516c-0.843-1.716-2.481-2.302-4.484-2.123c-8.514,0.765-17.016-0.538-25.537-0.353    c-1.124,0.024-2.768,0.221-3.163-1.25c-0.371-1.369,1.088-2.063,1.919-2.894c6.26-6.242,12.574-12.43,18.816-18.691    c9.303-9.327,18.565-18.714,27.851-28.066c1.848-1.859,3.701-3.713,5.549-5.572c2.655-2.661,5.309-5.315,7.958-7.982    c0.574-0.579,1.259-1.141,1.246-1.94c-0.004-0.257-0.078-0.538-0.254-0.853c-0.556-0.981-1.441-1.1-2.469-0.957    c-0.658,0.096-1.315,0.185-1.973,0.275c-3.844,0.538-7.689,1.076-11.533,1.608c-3.641,0.505-7.281,1.02-10.922,1.529    c-4.162,0.582-8.324,1.158-12.486,1.748c-1.142,0.161-2.409,1.662-3.354,0.508c-0.419-0.508-0.431-1.028-0.251-1.531    c0.269-0.741,0.957-1.441,1.387-2.021c3.414-4.58,6.882-9.124,10.356-13.662c1.74-2.272,3.48-4.544,5.214-6.822    c4.682-6.141,9.369-12.281,14.051-18.422c0.09-0.119,0.181-0.237,0.271-0.355c6.848-8.98,13.7-17.958,20.553-26.936    c0.488-0.64,0.977-1.28,1.465-1.92c2.159-2.828,4.315-5.658,6.476-8.486c4.197-5.501,8.454-10.954,12.67-16.442    c0.263-0.347,0.538-0.718,0.717-1.106c0.269-0.586,0.299-1.196-0.335-1.776c-0.825-0.753-1.8-0.15-2.595,0.419    c-0.67,0.472-1.333,0.957-1.955,1.489c-2.206,1.889-4.401,3.797-6.595,5.698c-3.958,3.438-7.922,6.876-11.976,10.194    c-2.443,2.003-4.865,4.028-7.301,6.038c-18.689-10.581-39.53-15.906-62.549-15.906c-35.54,0-65.911,12.607-91.125,37.82    c-25.214,25.215-37.821,55.592-37.821,91.126c0,35.54,12.607,65.91,37.821,91.125c4.146,4.146,8.445,7.916,12.87,11.381    c-9.015,11.14-18.036,22.277-27.034,33.429c-1.208,1.489-3.755,3.151-2.745,4.891c0.078,0.144,0.173,0.281,0.305,0.425    c1.321,1.429,3.492-1.303,4.933-2.457c6.673-5.333,13.333-10.685,19.982-16.042c3.707-2.984,7.417-5.965,11.124-8.952    c1.474-1.188,2.951-2.373,4.425-3.561c6.41-5.164,12.816-10.333,19.238-15.481L854.024,1585.195z M797.552,1498.009    c0-26.243,9.29-48.728,27.868-67.459c18.579-18.723,40.987-28.089,67.238-28.089c12.273,0,23.712,2.075,34.34,6.171    c-3.37,2.905-6.734,5.816-10.069,8.762c-6.075,5.351-12.365,10.469-18.667,15.564c-4.179,3.378-8.371,6.744-12.514,10.164    c-7.54,6.23-15.037,12.52-22.529,18.804c-7.091,5.955-14.182,11.904-21.19,17.949c-1.136,0.974-3.055,1.907-2.135,3.94    c0.831,1.836,2.774,1.417,4.341,1.578l12.145-0.599l14.151-0.698c1.031-0.102,2.192-0.257,2.89,0.632    c0.034,0.044,0.073,0.078,0.106,0.127c1.017,1.561-0.67,2.105-1.387,2.942c-6.308,7.318-12.616,14.637-18.978,21.907    c-8.161,9.339-16.353,18.649-24.544,27.958c-2.146,2.433-4.275,4.879-6.422,7.312c-1.034,1.172-2.129,2.272-1.238,3.922    c0.933,1.728,2.685,1.752,4.323,1.602c4.134-0.367,8.263-0.489,12.396-0.492c0.242,0,0.485-0.005,0.728-0.004    c2.711,0.009,5.422,0.068,8.134,0.145c2.582,0.074,5.166,0.165,7.752,0.249c0.275,1.62-0.879,2.356-1.62,3.259    c-1.333,1.626-2.667,3.247-4,4.867c-4.315,5.252-8.62,10.514-12.928,15.772c-3.562-2.725-7.007-5.733-10.324-9.051    C806.842,1546.667,797.552,1524.26,797.552,1498.009z"></path>
    </svg>
  `;
  const versionBadge = showVersion ? `
    <span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${variant === "white" ? "bg-white/10 text-white/80 ring-white/20" : "bg-cyan-50 text-cyan-700 ring-cyan-700/10 dark:bg-cyan-500/10 dark:text-cyan-400 dark:ring-cyan-500/20"}">
      ${version}
    </span>
  ` : "";
  const logoContent = showText ? `
    <div class="flex items-center gap-2 ${className}">
      ${logoSvg}
      ${versionBadge}
    </div>
  ` : logoSvg;
  if (href) {
    return `<a href="${href}" class="inline-block hover:opacity-80 transition-opacity">${logoContent}</a>`;
  }
  return logoContent;
}

// src/templates/layouts/admin-layout-catalyst.template.ts
function renderAdminLayoutCatalyst(data) {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - SonicJS AI Admin</title>
  <link rel="icon" type="image/x-icon" href="https://demo.sonicjs.com/images/favicon.ico">

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            zinc: {
              50: '#fafafa',
              100: '#f4f4f5',
              200: '#e4e4e7',
              300: '#d4d4d8',
              400: '#a1a1aa',
              500: '#71717a',
              600: '#52525b',
              700: '#3f3f46',
              800: '#27272a',
              900: '#18181b',
              950: '#09090b'
            }
          }
        }
      }
    }
  </script>

  <!-- Additional Styles -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #27272a;
    }

    ::-webkit-scrollbar-thumb {
      background: #52525b;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #71717a;
    }

    /* Smooth transitions */
    * {
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
  </style>

  <!-- Scripts -->
  <script src="https://unpkg.com/htmx.org@2.0.3"></script>
  <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

  ${data.styles ? data.styles.map((style) => `<link rel="stylesheet" href="${style}">`).join("\n  ") : ""}
  ${data.scripts ? data.scripts.map((script) => `<script src="${script}"></script>`).join("\n  ") : ""}
</head>
<body class="min-h-screen bg-white dark:bg-zinc-900">
  <div class="relative isolate flex min-h-svh w-full max-lg:flex-col lg:bg-zinc-100 dark:lg:bg-zinc-950">
    <!-- Sidebar on desktop -->
    <div class="fixed inset-y-0 left-0 w-64 max-lg:hidden">
      ${renderCatalystSidebar(
    data.currentPath,
    data.user,
    data.dynamicMenuItems,
    false,
    data.version,
    data.enableExperimentalFeatures
  )}
    </div>

    <!-- Mobile sidebar (hidden by default) -->
    <div id="mobile-sidebar-overlay" class="fixed inset-0 bg-black/30 lg:hidden hidden z-40" onclick="closeMobileSidebar()"></div>
    <div id="mobile-sidebar" class="fixed inset-y-0 left-0 w-80 transform -translate-x-full transition-transform duration-300 ease-in-out lg:hidden z-50">
      ${renderCatalystSidebar(
    data.currentPath,
    data.user,
    data.dynamicMenuItems,
    true,
    data.version,
    data.enableExperimentalFeatures
  )}
    </div>

    <!-- Main content area -->
    <main class="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pr-2 lg:pl-64">
      <!-- Mobile header with menu toggle -->
      <header class="flex items-center px-4 py-2.5 lg:hidden border-b border-zinc-950/5 dark:border-white/5">
        <button onclick="openMobileSidebar()" class="relative flex items-center justify-center rounded-lg p-2 text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5" aria-label="Open navigation">
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6.75C2 6.33579 2.33579 6 2.75 6H17.25C17.6642 6 18 6.33579 18 6.75C18 7.16421 17.6642 7.5 17.25 7.5H2.75C2.33579 7.5 2 7.16421 2 6.75ZM2 13.25C2 12.8358 2.33579 12.5 2.75 12.5H17.25C17.6642 12.5 18 12.8358 18 13.25C18 13.6642 17.6642 14 17.25 14H2.75C2.33579 14 2 13.6642 2 13.25Z" />
          </svg>
        </button>
        <div class="ml-4 flex-1">
          ${renderLogo({ size: "sm", showText: true, variant: "white", version: data.version, href: "/admin" })}
        </div>
      </header>

      <!-- Content -->
      <div class="grow p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
        ${data.content}
      </div>
    </main>
  </div>

  <!-- Notification Container -->
  <div id="notification-container" class="fixed top-4 right-4 z-50 space-y-2"></div>

  <script>
    // Mobile sidebar toggle
    function openMobileSidebar() {
      const sidebar = document.getElementById('mobile-sidebar');
      const overlay = document.getElementById('mobile-sidebar-overlay');
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
    }

    function closeMobileSidebar() {
      const sidebar = document.getElementById('mobile-sidebar');
      const overlay = document.getElementById('mobile-sidebar-overlay');
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }

    // User dropdown toggle
    function toggleUserDropdown() {
      const dropdown = document.getElementById('userDropdown');
      dropdown.classList.toggle('hidden');
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      const dropdown = document.getElementById('userDropdown');
      const button = event.target.closest('[data-user-menu]');
      if (!button && dropdown && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // Show notification
    function showNotification(message, type = 'info') {
      const container = document.getElementById('notification-container');
      const notification = document.createElement('div');
      const colors = {
        success: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-500/20',
        error: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20 dark:ring-red-500/20',
        warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-500/20',
        info: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-500/20'
      };

      notification.className = \`rounded-lg p-4 ring-1 \${colors[type] || colors.info} max-w-sm shadow-lg\`;
      notification.innerHTML = \`
        <div class="flex items-center justify-between">
          <span class="text-sm">\${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:opacity-70">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      \`;

      container.appendChild(notification);

      // Auto remove after 5 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
    }

    // Initialize dark mode
    if (localStorage.getItem('darkMode') === 'false') {
      document.documentElement.classList.remove('dark');
    }
  </script>
</body>
</html>`;
}
function renderCatalystSidebar(currentPath = "", user, dynamicMenuItems, isMobile = false, version, enableExperimentalFeatures) {
  let baseMenuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
      </svg>`
    },
    {
      label: "Collections",
      path: "/admin/collections",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
      </svg>`
    },
    {
      label: "Content",
      path: "/admin/content",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
      </svg>`
    },
    {
      label: "Media",
      path: "/admin/media",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
      </svg>`
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
      </svg>`
    }
  ];
  if (enableExperimentalFeatures) {
    baseMenuItems.push({
      label: "Plugins",
      path: "/admin/plugins",
      icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>`
    });
  }
  const settingsMenuItem = {
    label: "Settings",
    path: "/admin/settings",
    icon: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
    </svg>`
  };
  const allMenuItems = [...baseMenuItems];
  if (dynamicMenuItems && dynamicMenuItems.length > 0) {
    const usersIndex = allMenuItems.findIndex(
      (item) => item.path === "/admin/users"
    );
    if (usersIndex !== -1) {
      allMenuItems.splice(usersIndex + 1, 0, ...dynamicMenuItems);
    } else {
      allMenuItems.push(...dynamicMenuItems);
    }
  }
  const closeButton = isMobile ? `
    <div class="-mb-3 px-4 pt-3">
      <button onclick="closeMobileSidebar()" class="relative flex w-full items-center gap-3 rounded-lg p-2 text-left text-base/6 font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5 sm:text-sm/5" aria-label="Close navigation">
        <svg class="h-5 w-5 shrink-0 fill-zinc-500 dark:fill-zinc-400" viewBox="0 0 20 20">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
        <span>Close menu</span>
      </button>
    </div>
  ` : "";
  return `
    <nav class="flex h-full min-h-0 flex-col bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 ${isMobile ? "rounded-lg p-2 m-2" : ""}">
      ${closeButton}

      <!-- Sidebar Header -->
      <div class="flex flex-col border-b border-zinc-950/5 p-4 dark:border-white/5">
        ${renderLogo({ size: "md", showText: true, variant: "white", version, href: "/admin" })}
      </div>

      <!-- Sidebar Body -->
      <div class="flex flex-1 flex-col overflow-y-auto p-4">
        <div class="flex flex-col gap-0.5">
          ${allMenuItems.map((item) => {
    const isActive = currentPath === item.path || item.path !== "/admin" && currentPath?.startsWith(item.path);
    return `
              <span class="relative">
                ${isActive ? `
                  <span class="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-cyan-500 dark:bg-cyan-400"></span>
                ` : ""}
                <a
                  href="${item.path}"
                  class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm/5 font-medium ${isActive ? "text-zinc-950 dark:text-white" : "text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5"}"
                  ${isActive ? 'data-current="true"' : ""}
                >
                  <span class="shrink-0 ${isActive ? "fill-zinc-950 dark:fill-white" : "fill-zinc-500 dark:fill-zinc-400"}">
                    ${item.icon}
                  </span>
                  <span class="truncate">${item.label}</span>
                </a>
              </span>
            `;
  }).join("")}
        </div>
      </div>

      <!-- Settings Menu Item (Bottom) -->
      <div class="border-t border-zinc-950/5 p-4 dark:border-white/5">
        ${(() => {
    const isActive = currentPath === settingsMenuItem.path || currentPath?.startsWith(settingsMenuItem.path);
    return `
            <span class="relative">
              ${isActive ? `
                <span class="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-cyan-500 dark:bg-cyan-400"></span>
              ` : ""}
              <a
                href="${settingsMenuItem.path}"
                class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm/5 font-medium ${isActive ? "text-zinc-950 dark:text-white" : "text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5"}"
                ${isActive ? 'data-current="true"' : ""}
              >
                <span class="shrink-0 ${isActive ? "fill-zinc-950 dark:fill-white" : "fill-zinc-500 dark:fill-zinc-400"}">
                  ${settingsMenuItem.icon}
                </span>
                <span class="truncate">${settingsMenuItem.label}</span>
              </a>
            </span>
          `;
  })()}
      </div>

      <!-- Sidebar Footer (User) -->
      ${user ? `
        <div class="flex flex-col border-t border-zinc-950/5 p-4 dark:border-white/5">
          <div class="relative">
            <button
              data-user-menu
              onclick="toggleUserDropdown()"
              class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm/5 font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5"
            >
              <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                <span class="text-xs font-semibold">${(user.name || user.email || "U").charAt(0).toUpperCase()}</span>
              </div>
              <span class="flex-1 truncate">${user.name || user.email || "User"}</span>
              <svg class="h-4 w-4 shrink-0 fill-zinc-500 dark:fill-zinc-400" viewBox="0 0 20 20">
                <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>

            <!-- User Dropdown -->
            <div id="userDropdown" class="hidden absolute bottom-full mb-2 left-0 right-0 mx-2 rounded-xl bg-white shadow-lg ring-1 ring-zinc-950/10 dark:bg-zinc-800 dark:ring-white/10 z-50">
              <div class="p-2">
                <div class="px-3 py-2 border-b border-zinc-950/5 dark:border-white/5">
                  <p class="text-sm font-medium text-zinc-950 dark:text-white">${user.name || user.email || "User"}</p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">${user.email || ""}</p>
                </div>
                <a href="/admin/profile" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  My Profile
                </a>
                <a href="/admin/settings" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Settings
                </a>
                <a href="/auth/logout" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Sign Out
                </a>
              </div>
            </div>
          </div>
        </div>
      ` : ""}
    </nav>
  `;
}

// src/templates/components/dynamic-field.template.ts
function renderDynamicField(field, options = {}) {
  const { value = "", errors = [], disabled = false, className = "" } = options;
  const opts = field.field_options || {};
  const required = field.is_required ? "required" : "";
  const baseClasses = `w-full rounded-lg px-3 py-2 text-sm text-zinc-950 dark:text-white bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow ${className}`;
  const errorClasses = errors.length > 0 ? "ring-pink-600 dark:ring-pink-500 focus:ring-pink-600 dark:focus:ring-pink-500" : "";
  const fieldId = `field-${field.field_name}`;
  const fieldName = field.field_name;
  let fieldHTML = "";
  switch (field.field_type) {
    case "text":
      let patternHelp = "";
      let autoSlugScript = "";
      if (opts.pattern) {
        if (opts.pattern === "^[a-z0-9-]+$" || opts.pattern === "^[a-zA-Z0-9_-]+$") {
          patternHelp = '<p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Use letters, numbers, underscores, and hyphens only</p>';
          if (fieldName === "slug") {
            patternHelp += `<button type="button" class="mt-1 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300" onclick="generateSlugFromTitle('\${fieldId}')">Generate from title</button>`;
            autoSlugScript = `
              <script>
                function generateSlugFromTitle(slugFieldId) {
                  const titleField = document.querySelector('input[name="title"]');
                  const slugField = document.getElementById(slugFieldId);
                  if (titleField && slugField) {
                    const slug = titleField.value
                      .toLowerCase()
                      .replace(/[^a-z0-9\\s_-]/g, '')
                      .replace(/\\s+/g, '-')
                      .replace(/[-_]+/g, '-')
                      .replace(/^[-_]|[-_]$/g, '');
                    slugField.value = slug;
                  }
                }
                
                // Auto-generate slug when title changes
                document.addEventListener('DOMContentLoaded', function() {
                  const titleField = document.querySelector('input[name="title"]');
                  const slugField = document.getElementById('${fieldId}');
                  if (titleField && slugField && !slugField.value) {
                    titleField.addEventListener('input', function() {
                      if (!slugField.value) {
                        generateSlugFromTitle('${fieldId}');
                      }
                    });
                  }
                });
              </script>
            `;
          }
        } else {
          patternHelp = '<p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Must match required format</p>';
        }
      }
      fieldHTML = `
        <input 
          type="text" 
          id="${fieldId}"
          name="${fieldName}"
          value="${escapeHtml(value)}"
          placeholder="${opts.placeholder || ""}"
          maxlength="${opts.maxLength || ""}"
          ${opts.pattern ? `data-pattern="${opts.pattern}"` : ""}
          class="${baseClasses} ${errorClasses}"
          ${required}
          ${disabled ? "disabled" : ""}
        >
        ${patternHelp}
        ${autoSlugScript}
        ${opts.pattern ? `
        <script>
          (function() {
            const field = document.getElementById('${fieldId}');
            const pattern = new RegExp('${opts.pattern}');
            
            field.addEventListener('input', function() {
              if (this.value && !pattern.test(this.value)) {
                if ('${opts.pattern}' === '^[a-zA-Z0-9_-]+$' || '${opts.pattern}' === '^[a-z0-9-]+$') {
                  this.setCustomValidity('Please use only letters, numbers, underscores, and hyphens.');
                } else {
                  this.setCustomValidity('Please enter a valid format.');
                }
              } else {
                this.setCustomValidity('');
              }
            });
            
            field.addEventListener('blur', function() {
              this.reportValidity();
            });
          })();
        </script>
        ` : ""}
      `;
      break;
    case "richtext":
      fieldHTML = `
        <div class="richtext-container">
          <textarea 
            id="${fieldId}"
            name="${fieldName}"
            class="${baseClasses} ${errorClasses} min-h-[${opts.height || 300}px]"
            ${required}
            ${disabled ? "disabled" : ""}
          >${escapeHtml(value)}</textarea>
          <script>
            // Initialize TinyMCE for this field
            if (typeof tinymce !== 'undefined') {
              tinymce.init({
                selector: '#${fieldId}',
                skin: 'oxide-dark',
                content_css: 'dark',
                height: ${opts.height || 300},
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: '${opts.toolbar === "simple" ? "bold italic underline | bullist numlist | link" : "undo redo | blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help"}',
                content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; color: #fff; background-color: #1f2937; }',
                setup: function(editor) {
                  editor.on('change', function() {
                    editor.save();
                  });
                }
              });
            }
          </script>
        </div>
      `;
      break;
    case "number":
      fieldHTML = `
        <input 
          type="number" 
          id="${fieldId}"
          name="${fieldName}"
          value="${value}"
          min="${opts.min || ""}"
          max="${opts.max || ""}"
          step="${opts.step || ""}"
          placeholder="${opts.placeholder || ""}"
          class="${baseClasses} ${errorClasses}"
          ${required}
          ${disabled ? "disabled" : ""}
        >
      `;
      break;
    case "boolean":
      const checked = value === true || value === "true" || value === "1" ? "checked" : "";
      fieldHTML = `
        <div class="flex items-center space-x-3">
          <input 
            type="checkbox" 
            id="${fieldId}"
            name="${fieldName}"
            value="true"
            class="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
            ${checked}
            ${disabled ? "disabled" : ""}
          >
          <label for="${fieldId}" class="text-sm text-gray-300">
            ${opts.checkboxLabel || field.field_label}
          </label>
        </div>
        <input type="hidden" name="${fieldName}_submitted" value="1">
      `;
      break;
    case "date":
      fieldHTML = `
        <input 
          type="date" 
          id="${fieldId}"
          name="${fieldName}"
          value="${value}"
          min="${opts.min || ""}"
          max="${opts.max || ""}"
          class="${baseClasses} ${errorClasses}"
          ${required}
          ${disabled ? "disabled" : ""}
        >
      `;
      break;
    case "select":
      const options2 = opts.options || [];
      const multiple = opts.multiple ? "multiple" : "";
      const selectedValues = Array.isArray(value) ? value : [value];
      fieldHTML = `
        <select 
          id="${fieldId}"
          name="${fieldName}${opts.multiple ? "[]" : ""}"
          class="${baseClasses} ${errorClasses}"
          ${multiple}
          ${required}
          ${disabled ? "disabled" : ""}
        >
          ${!required && !opts.multiple ? '<option value="">Choose an option...</option>' : ""}
          ${options2.map((option) => {
        const optionValue = typeof option === "string" ? option : option.value;
        const optionLabel = typeof option === "string" ? option : option.label;
        const selected = selectedValues.includes(optionValue) ? "selected" : "";
        return `<option value="${escapeHtml(optionValue)}" ${selected}>${escapeHtml(optionLabel)}</option>`;
      }).join("")}
        </select>
        ${opts.allowCustom ? `
          <div class="mt-2">
            <input 
              type="text" 
              placeholder="Add custom option..."
              class="${baseClasses.replace("border-white/10", "border-white/5")} text-sm"
              onkeypress="if(event.key==='Enter'){addCustomOption(this, '${fieldId}');event.preventDefault();}"
            >
          </div>
        ` : ""}
      `;
      break;
    case "media":
      fieldHTML = `
        <div class="media-field-container">
          <input type="hidden" id="${fieldId}" name="${fieldName}" value="${value}">
          <div class="media-preview ${value ? "" : "hidden"}" id="${fieldId}-preview">
            ${value ? `<img src="${value}" alt="Selected media" class="w-32 h-32 object-cover rounded-lg border border-white/20">` : ""}
          </div>
          <div class="media-actions mt-2 space-x-2">
            <button
              type="button"
              onclick="openMediaSelector('${fieldId}')"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
              ${disabled ? "disabled" : ""}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Select Media
            </button>
            ${value ? `
              <button
                type="button"
                onclick="clearMediaField('${fieldId}')"
                class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                ${disabled ? "disabled" : ""}
              >
                Remove
              </button>
            ` : ""}
          </div>
        </div>
      `;
      break;
    case "guid":
      fieldHTML = `
        <div class="guid-field-container">
          <input
            type="text"
            id="${fieldId}"
            name="${fieldName}"
            value="${escapeHtml(value)}"
            class="${baseClasses} bg-zinc-100 dark:bg-zinc-800/50 cursor-not-allowed"
            readonly
            disabled
          >
          <div class="mt-2 flex items-start gap-x-2">
            <svg class="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
            </svg>
            <div class="text-xs text-zinc-600 dark:text-zinc-400">
              ${value ? "This unique identifier was automatically generated and cannot be changed." : "A unique identifier (UUID) will be automatically generated when you save this content."}
            </div>
          </div>
        </div>
      `;
      break;
    default:
      fieldHTML = `
        <input 
          type="text" 
          id="${fieldId}"
          name="${fieldName}"
          value="${escapeHtml(value)}"
          class="${baseClasses} ${errorClasses}"
          ${required}
          ${disabled ? "disabled" : ""}
        >
      `;
  }
  return `
    <div class="form-group">
      <label for="${fieldId}" class="block text-sm/6 font-medium text-zinc-950 dark:text-white mb-2">
        ${escapeHtml(field.field_label)}
        ${field.is_required ? '<span class="text-pink-600 dark:text-pink-400 ml-1">*</span>' : ""}
      </label>
      ${fieldHTML}
      ${errors.length > 0 ? `
        <div class="mt-2 text-sm text-pink-600 dark:text-pink-400">
          ${errors.map((error) => `<div>${escapeHtml(error)}</div>`).join("")}
        </div>
      ` : ""}
      ${opts.helpText ? `
        <div class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          ${escapeHtml(opts.helpText)}
        </div>
      ` : ""}
    </div>
  `;
}
function renderFieldGroup(title, fields, collapsible = false) {
  const groupId = title.toLowerCase().replace(/\s+/g, "-");
  return `
    <div class="field-group rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 mb-6">
      <div class="field-group-header border-b border-zinc-950/5 dark:border-white/10 px-6 py-4 ${collapsible ? "cursor-pointer" : ""}" ${collapsible ? `onclick="toggleFieldGroup('${groupId}')"` : ""}>
        <h3 class="text-base/7 font-semibold text-zinc-950 dark:text-white flex items-center">
          ${escapeHtml(title)}
          ${collapsible ? `
            <svg id="${groupId}-icon" class="w-5 h-5 ml-2 transform transition-transform text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          ` : ""}
        </h3>
      </div>
      <div id="${groupId}-content" class="field-group-content px-6 py-6 space-y-6 ${collapsible ? "collapsible" : ""}">
        ${fields.join("")}
      </div>
    </div>
  `;
}
function escapeHtml(text) {
  if (typeof text !== "string") return String(text || "");
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char] || char);
}

// src/templates/components/confirmation-dialog.template.ts
function renderConfirmationDialog(options) {
  const {
    id,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmClass = "bg-red-500 hover:bg-red-400",
    iconColor = "red",
    onConfirm = ""
  } = options;
  const iconColorClasses = {
    red: "bg-red-500/10 text-red-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    blue: "bg-blue-500/10 text-blue-400"
  };
  return `
    <el-dialog>
      <dialog
        id="${id}"
        aria-labelledby="${id}-title"
        class="fixed inset-0 m-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent p-0 backdrop:bg-transparent"
      >
        <el-dialog-backdrop class="fixed inset-0 bg-gray-900/50 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"></el-dialog-backdrop>

        <div tabindex="0" class="flex min-h-full items-end justify-center p-4 text-center focus:outline focus:outline-0 sm:items-center sm:p-0">
          <el-dialog-panel class="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl outline outline-1 -outline-offset-1 outline-white/10 transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${iconColorClasses[iconColor]} sm:mx-0 sm:size-10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 id="${id}-title" class="text-base font-semibold text-white">${title}</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-400">${message}</p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onclick="${onConfirm}; document.getElementById('${id}').close()"
                command="close"
                commandfor="${id}"
                class="confirm-button inline-flex w-full justify-center rounded-md ${confirmClass} px-3 py-2 text-sm font-semibold text-white sm:ml-3 sm:w-auto"
              >
                ${confirmText}
              </button>
              <button
                type="button"
                command="close"
                commandfor="${id}"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/5 hover:bg-white/20 sm:mt-0 sm:w-auto"
              >
                ${cancelText}
              </button>
            </div>
          </el-dialog-panel>
        </div>
      </dialog>
    </el-dialog>
  `;
}
function getConfirmationDialogScript() {
  return `
    <script src="https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1" type="module"></script>
    <script>
      function showConfirmDialog(dialogId) {
        const dialog = document.getElementById(dialogId);
        if (dialog) {
          dialog.showModal();
        }
      }
    </script>
  `;
}

// src/templates/pages/admin-content-form.template.ts
function renderContentFormPage(data) {
  const isEdit = data.isEdit || !!data.id;
  const title = isEdit ? `Edit: ${data.title || "Content"}` : `New ${data.collection.display_name}`;
  const backUrl = data.referrerParams ? `/admin/content?${data.referrerParams}` : `/admin/content?collection=${data.collection.id}`;
  const coreFields = data.fields.filter((f) => ["title", "slug", "content"].includes(f.field_name));
  const contentFields = data.fields.filter((f) => !["title", "slug", "content"].includes(f.field_name) && !f.field_name.startsWith("meta_"));
  const metaFields = data.fields.filter((f) => f.field_name.startsWith("meta_"));
  const getFieldValue = (fieldName) => {
    if (fieldName === "title") return data.title || data.data?.[fieldName] || "";
    if (fieldName === "slug") return data.slug || data.data?.[fieldName] || "";
    return data.data?.[fieldName] || "";
  };
  const coreFieldsHTML = coreFields.sort((a, b) => a.field_order - b.field_order).map((field) => renderDynamicField(field, {
    value: getFieldValue(field.field_name),
    errors: data.validationErrors?.[field.field_name] || []
  }));
  const contentFieldsHTML = contentFields.sort((a, b) => a.field_order - b.field_order).map((field) => renderDynamicField(field, {
    value: getFieldValue(field.field_name),
    errors: data.validationErrors?.[field.field_name] || []
  }));
  const metaFieldsHTML = metaFields.sort((a, b) => a.field_order - b.field_order).map((field) => renderDynamicField(field, {
    value: getFieldValue(field.field_name),
    errors: data.validationErrors?.[field.field_name] || []
  }));
  const pageContent = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">${isEdit ? "Edit Content" : "New Content"}</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
            ${data.collection.description || `Manage ${data.collection.display_name.toLowerCase()} content`}
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="${backUrl}" class="inline-flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Content
          </a>
        </div>
      </div>

      <!-- Form Container -->
      <div class="rounded-lg bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 overflow-hidden">
        <!-- Form Header -->
        <div class="border-b border-zinc-950/5 dark:border-white/10 px-6 py-6">
          <div class="flex items-center gap-x-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800 ring-1 ring-zinc-950/10 dark:ring-white/10">
              <svg class="h-6 w-6 text-zinc-950 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-base/7 font-semibold text-zinc-950 dark:text-white">${data.collection.display_name}</h2>
              <p class="text-sm/6 text-zinc-500 dark:text-zinc-400">${isEdit ? "Update your content" : "Create new content"}</p>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <div class="px-6 py-6">
          <div id="form-messages">
            ${data.error ? renderAlert({ type: "error", message: data.error, dismissible: true }) : ""}
            ${data.success ? renderAlert({ type: "success", message: data.success, dismissible: true }) : ""}
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content Form -->
        <div class="lg:col-span-2">
          <form
            id="content-form"
            ${isEdit ? `hx-put="/admin/content/${data.id}"` : `hx-post="/admin/content"`}
            hx-target="#form-messages"
            hx-encoding="multipart/form-data"
            class="space-y-6"
          >
            <input type="hidden" name="collection_id" value="${data.collection.id}">
            ${isEdit ? `<input type="hidden" name="id" value="${data.id}">` : ""}
            ${data.referrerParams ? `<input type="hidden" name="referrer_params" value="${data.referrerParams}">` : ""}
            
            <!-- Core Fields -->
            ${renderFieldGroup("Basic Information", coreFieldsHTML)}
            
            <!-- Content Fields -->
            ${contentFields.length > 0 ? renderFieldGroup("Content Details", contentFieldsHTML) : ""}
            
            <!-- SEO & Meta Fields -->
            ${metaFields.length > 0 ? renderFieldGroup("SEO & Metadata", metaFieldsHTML, true) : ""}
            
            <div id="form-messages"></div>
          </form>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Publishing Options -->
          <div class="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
            <h3 class="text-base/7 font-semibold text-zinc-950 dark:text-white mb-4">Publishing</h3>

            ${data.workflowEnabled ? `
              <!-- Workflow Status (when workflow plugin is enabled) -->
              <div class="mb-4">
                <label for="status" class="block text-sm/6 font-medium text-zinc-950 dark:text-white">Status</label>
                <div class="mt-2 grid grid-cols-1">
                  <select
                    id="status"
                    name="status"
                    form="content-form"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-zinc-500/30 dark:outline-zinc-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400 sm:text-sm/6"
                  >
                    <option value="draft" ${data.status === "draft" ? "selected" : ""}>Draft</option>
                    <option value="review" ${data.status === "review" ? "selected" : ""}>Under Review</option>
                    <option value="published" ${data.status === "published" ? "selected" : ""}>Published</option>
                    <option value="archived" ${data.status === "archived" ? "selected" : ""}>Archived</option>
                  </select>
                  <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-zinc-600 dark:text-zinc-400 sm:size-4">
                    <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                  </svg>
                </div>
              </div>

              <!-- Scheduled Publishing -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Schedule Publish</label>
                <input
                  type="datetime-local"
                  name="scheduled_publish_at"
                  form="content-form"
                  value="${data.scheduled_publish_at ? new Date(data.scheduled_publish_at).toISOString().slice(0, 16) : ""}"
                  class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
                >
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Leave empty to publish immediately</p>
              </div>

              <!-- Scheduled Unpublishing -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Schedule Unpublish</label>
                <input
                  type="datetime-local"
                  name="scheduled_unpublish_at"
                  form="content-form"
                  value="${data.scheduled_unpublish_at ? new Date(data.scheduled_unpublish_at).toISOString().slice(0, 16) : ""}"
                  class="w-full rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-shadow"
                >
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Automatically unpublish at this time</p>
              </div>
            ` : `
              <!-- Simple Status (when workflow plugin is disabled) -->
              <div class="mb-6">
                <label for="status" class="block text-sm/6 font-medium text-zinc-950 dark:text-white">Status</label>
                <div class="mt-2 grid grid-cols-1">
                  <select
                    id="status"
                    name="status"
                    form="content-form"
                    class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-zinc-500/30 dark:outline-zinc-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400 sm:text-sm/6"
                  >
                    <option value="draft" ${data.status === "draft" ? "selected" : ""}>Draft</option>
                    <option value="published" ${data.status === "published" ? "selected" : ""}>Published</option>
                  </select>
                  <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-zinc-600 dark:text-zinc-400 sm:size-4">
                    <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                  </svg>
                </div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Enable Workflow plugin for advanced status management</p>
              </div>
            `}
          </div>

          <!-- Content Info -->
          ${isEdit ? `
            <div class="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
              <h3 class="text-base/7 font-semibold text-zinc-950 dark:text-white mb-4">Content Info</h3>

              <dl class="space-y-3 text-sm">
                <div>
                  <dt class="text-zinc-500 dark:text-zinc-400">Created</dt>
                  <dd class="mt-1 text-zinc-950 dark:text-white">${data.data?.created_at ? new Date(data.data.created_at).toLocaleDateString() : "Unknown"}</dd>
                </div>
                <div>
                  <dt class="text-zinc-500 dark:text-zinc-400">Last Modified</dt>
                  <dd class="mt-1 text-zinc-950 dark:text-white">${data.data?.updated_at ? new Date(data.data.updated_at).toLocaleDateString() : "Unknown"}</dd>
                </div>
                <div>
                  <dt class="text-zinc-500 dark:text-zinc-400">Author</dt>
                  <dd class="mt-1 text-zinc-950 dark:text-white">${data.data?.author || "Unknown"}</dd>
                </div>
                ${data.data?.published_at ? `
                  <div>
                    <dt class="text-zinc-500 dark:text-zinc-400">Published</dt>
                    <dd class="mt-1 text-zinc-950 dark:text-white">${new Date(data.data.published_at).toLocaleDateString()}</dd>
                  </div>
                ` : ""}
              </dl>

              <div class="mt-4 pt-4 border-t border-zinc-950/5 dark:border-white/10">
                <button
                  type="button"
                  onclick="showVersionHistory('${data.id}')"
                  class="inline-flex items-center gap-x-1.5 text-sm font-medium text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  View Version History
                </button>
              </div>
            </div>
          ` : ""}

          <!-- Quick Actions -->
          <div class="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
            <h3 class="text-base/7 font-semibold text-zinc-950 dark:text-white mb-4">Quick Actions</h3>

            <div class="space-y-2">
              <button
                type="button"
                onclick="previewContent()"
                class="w-full inline-flex items-center gap-x-2 px-3 py-2 text-sm font-medium text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Preview Content
              </button>

              <button
                type="button"
                onclick="duplicateContent()"
                class="w-full inline-flex items-center gap-x-2 px-3 py-2 text-sm font-medium text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Duplicate Content
              </button>

              ${isEdit ? `
                <button
                  type="button"
                  onclick="deleteContent('${data.id}')"
                  class="w-full inline-flex items-center gap-x-2 px-3 py-2 text-sm font-medium text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                  </svg>
                  Delete Content
                </button>
              ` : ""}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 pt-6 border-t border-zinc-950/5 dark:border-white/10 flex items-center justify-between">
          <a href="${backUrl}" class="inline-flex items-center justify-center gap-x-1.5 rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Cancel
          </a>

          <div class="flex items-center gap-x-3">
            <button
              type="submit"
              form="content-form"
              name="action"
              value="save"
              class="inline-flex items-center justify-center gap-x-1.5 rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              ${isEdit ? "Update" : "Save"}
            </button>

            ${data.user?.role !== "viewer" ? `
              <button
                type="submit"
                form="content-form"
                name="action"
                value="save_and_publish"
                class="inline-flex items-center justify-center gap-x-1.5 rounded-lg bg-lime-600 dark:bg-lime-500 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-lime-700 dark:hover:bg-lime-600 transition-colors shadow-sm"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                ${isEdit ? "Update" : "Save"} & Publish
              </button>
            ` : ""}
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Confirmation Dialogs -->
    ${renderConfirmationDialog({
    id: "duplicate-content-confirm",
    title: "Duplicate Content",
    message: "Create a copy of this content?",
    confirmText: "Duplicate",
    cancelText: "Cancel",
    iconColor: "blue",
    confirmClass: "bg-blue-500 hover:bg-blue-400",
    onConfirm: "performDuplicateContent()"
  })}

    ${renderConfirmationDialog({
    id: "delete-content-confirm",
    title: "Delete Content",
    message: "Are you sure you want to delete this content? This action cannot be undone.",
    confirmText: "Delete",
    cancelText: "Cancel",
    iconColor: "red",
    confirmClass: "bg-red-500 hover:bg-red-400",
    onConfirm: `performDeleteContent('${data.id}')`
  })}

    ${getConfirmationDialogScript()}

    <!-- TinyMCE CDN -->
    <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>

    <!-- Dynamic Field Scripts -->
    <script>
      // Field group toggle
      function toggleFieldGroup(groupId) {
        const content = document.getElementById(groupId + '-content');
        const icon = document.getElementById(groupId + '-icon');
        
        if (content.classList.contains('hidden')) {
          content.classList.remove('hidden');
          icon.classList.remove('rotate-[-90deg]');
        } else {
          content.classList.add('hidden');
          icon.classList.add('rotate-[-90deg]');
        }
      }

      // Media field functions
      let currentMediaFieldId = null;

      function openMediaSelector(fieldId) {
        currentMediaFieldId = fieldId;
        // Store the original value in case user cancels
        const originalValue = document.getElementById(fieldId)?.value || '';

        // Open media library modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.id = 'media-selector-modal';
        modal.innerHTML = \`
          <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-zinc-950/5 dark:ring-white/10 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 class="text-lg font-semibold text-zinc-950 dark:text-white mb-4">Select Media</h3>
            <div id="media-grid-container" hx-get="/admin/media/selector" hx-trigger="load"></div>
            <div class="mt-4 flex justify-end space-x-2">
              <button
                onclick="cancelMediaSelection('\${fieldId}', '\${originalValue}')"
                class="rounded-lg bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                Cancel
              </button>
              <button
                onclick="closeMediaSelector()"
                class="rounded-lg bg-zinc-950 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                OK
              </button>
            </div>
          </div>
        \`;
        document.body.appendChild(modal);
        // Trigger HTMX for the modal content
        if (window.htmx) {
          htmx.process(modal);
        }
      }

      function closeMediaSelector() {
        const modal = document.getElementById('media-selector-modal');
        if (modal) {
          modal.remove();
        }
        currentMediaFieldId = null;
      }

      function cancelMediaSelection(fieldId, originalValue) {
        // Restore original value
        const hiddenInput = document.getElementById(fieldId);
        if (hiddenInput) {
          hiddenInput.value = originalValue;
        }

        // If original value was empty, hide the preview and show select button
        if (!originalValue) {
          const preview = document.getElementById(fieldId + '-preview');
          if (preview) {
            preview.classList.add('hidden');
          }
        }

        // Close modal
        closeMediaSelector();
      }

      function clearMediaField(fieldId) {
        document.getElementById(fieldId).value = '';
        document.getElementById(fieldId + '-preview').classList.add('hidden');
      }

      // Global function called by media selector buttons
      window.selectMediaFile = function(mediaId, mediaUrl, filename) {
        if (!currentMediaFieldId) {
          console.error('No field ID set for media selection');
          return;
        }

        const fieldId = currentMediaFieldId;

        // Set the hidden input value to the media URL (not ID)
        const hiddenInput = document.getElementById(fieldId);
        if (hiddenInput) {
          hiddenInput.value = mediaUrl;
        }

        // Update the preview
        const preview = document.getElementById(fieldId + '-preview');
        if (preview) {
          preview.innerHTML = \`<img src="\${mediaUrl}" alt="\${filename}" class="w-32 h-32 object-cover rounded-lg border border-white/20">\`;
          preview.classList.remove('hidden');
        }

        // Show the remove button by finding the media actions container and updating it
        const mediaField = hiddenInput?.closest('.media-field-container');
        if (mediaField) {
          const actionsDiv = mediaField.querySelector('.media-actions');
          if (actionsDiv && !actionsDiv.querySelector('button:has-text("Remove")')) {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.onclick = () => clearMediaField(fieldId);
            removeBtn.className = 'inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all';
            removeBtn.textContent = 'Remove';
            actionsDiv.appendChild(removeBtn);
          }
        }

        // DON'T close the modal - let user click OK button
        // Visual feedback: highlight the selected item
        document.querySelectorAll('#media-selector-grid [data-media-id]').forEach(el => {
          el.classList.remove('ring-2', 'ring-lime-500', 'dark:ring-lime-400');
        });
        const selectedItem = document.querySelector(\`#media-selector-grid [data-media-id="\${mediaId}"]\`);
        if (selectedItem) {
          selectedItem.classList.add('ring-2', 'ring-lime-500', 'dark:ring-lime-400');
        }
      };

      function setMediaField(fieldId, mediaUrl) {
        document.getElementById(fieldId).value = mediaUrl;
        const preview = document.getElementById(fieldId + '-preview');
        preview.innerHTML = \`<img src="\${mediaUrl}" alt="Selected media" class="w-32 h-32 object-cover rounded-lg ring-1 ring-zinc-950/10 dark:ring-white/10">\`;
        preview.classList.remove('hidden');

        // Close modal
        document.querySelector('.fixed.inset-0')?.remove();
      }

      // Custom select options
      function addCustomOption(input, selectId) {
        const value = input.value.trim();
        if (value) {
          const select = document.getElementById(selectId);
          const option = document.createElement('option');
          option.value = value;
          option.text = value;
          option.selected = true;
          select.appendChild(option);
          input.value = '';
        }
      }

      // Quick actions
      function previewContent() {
        const form = document.getElementById('content-form');
        const formData = new FormData(form);
        
        // Open preview in new window
        const preview = window.open('', '_blank');
        preview.document.write('<p>Loading preview...</p>');
        
        fetch('/admin/content/preview', {
          method: 'POST',
          body: formData
        })
        .then(response => response.text())
        .then(html => {
          preview.document.open();
          preview.document.write(html);
          preview.document.close();
        })
        .catch(error => {
          preview.document.write('<p>Error loading preview</p>');
        });
      }

      function duplicateContent() {
        showConfirmDialog('duplicate-content-confirm');
      }

      function performDuplicateContent() {
        const form = document.getElementById('content-form');
        const formData = new FormData(form);
        formData.append('action', 'duplicate');

        fetch('/admin/content/duplicate', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            window.location.href = \`/admin/content/\${data.id}/edit\`;
          } else {
            alert('Error duplicating content');
          }
        });
      }

      function deleteContent(contentId) {
        showConfirmDialog('delete-content-confirm');
      }

      function performDeleteContent(contentId) {
        fetch(\`/admin/content/\${contentId}\`, {
          method: 'DELETE'
        })
        .then(response => {
          if (response.ok) {
            window.location.href = '/admin/content';
          } else {
            alert('Error deleting content');
          }
        });
      }

      function showVersionHistory(contentId) {
        // Create and show version history modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = \`
          <div id="version-history-content">
            <div class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          </div>
        \`;
        document.body.appendChild(modal);

        // Load version history
        fetch(\`/admin/content/\${contentId}/versions\`)
        .then(response => response.text())
        .then(html => {
          document.getElementById('version-history-content').innerHTML = html;
        })
        .catch(error => {
          console.error('Error loading version history:', error);
          document.getElementById('version-history-content').innerHTML = '<p class="text-zinc-950 dark:text-white">Error loading version history</p>';
        });
      }

      // Auto-save functionality
      let autoSaveTimeout;
      function scheduleAutoSave() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
          const form = document.getElementById('content-form');
          const formData = new FormData(form);
          formData.append('action', 'autosave');
          
          fetch(form.action, {
            method: 'POST',
            body: formData
          })
          .then(response => {
            if (response.ok) {
              console.log('Auto-saved');
            }
          })
          .catch(error => console.error('Auto-save failed:', error));
        }, 30000); // Auto-save every 30 seconds
      }

      // Bind auto-save to form changes
      document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('content-form');
        form.addEventListener('input', scheduleAutoSave);
        form.addEventListener('change', scheduleAutoSave);
      });
    </script>
  `;
  const layoutData = {
    title,
    currentPath: "/admin/content",
    user: data.user,
    content: pageContent,
    version: data.version
  };
  return renderAdminLayoutCatalyst(layoutData);
}

// src/templates/components/table.template.ts
function renderTable(data) {
  const tableId = data.tableId || `table-${Math.random().toString(36).substr(2, 9)}`;
  if (data.rows.length === 0) {
    return `
      <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-8 text-center">
        <div class="text-zinc-500 dark:text-zinc-400">
          <svg class="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">${data.emptyMessage || "No data available"}</p>
        </div>
      </div>
    `;
  }
  return `
    <div class="${data.className || ""}" id="${tableId}">
      ${data.title ? `
        <div class="px-4 sm:px-0 mb-4">
          <h3 class="text-base font-semibold text-zinc-950 dark:text-white">${data.title}</h3>
        </div>
      ` : ""}
      <div class="overflow-x-auto">
        <table class="min-w-full sortable-table">
          <thead>
            <tr>
              ${data.selectable ? `
                <th class="px-4 py-3.5 text-center sm:pl-0">
                  <div class="flex items-center justify-center">
                    <div class="group grid size-4 grid-cols-1">
                      <input type="checkbox" id="select-all-${tableId}" class="col-start-1 row-start-1 appearance-none rounded border border-white/10 bg-white/5 checked:border-cyan-500 checked:bg-cyan-500 indeterminate:border-cyan-500 indeterminate:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:border-white/5 disabled:bg-white/10 disabled:checked:bg-white/10 forced-colors:appearance-auto row-checkbox" />
                      <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-white/25">
                        <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                        <path d="M3 7H11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:indeterminate]:opacity-100" />
                      </svg>
                    </div>
                  </div>
                </th>
              ` : ""}
              ${data.columns.map((column, index) => {
    const isFirst = index === 0 && !data.selectable;
    const isLast = index === data.columns.length - 1;
    return `
                <th class="px-4 py-3.5 text-left text-sm font-semibold text-zinc-950 dark:text-white ${isFirst ? "sm:pl-0" : ""} ${isLast ? "sm:pr-0" : ""} ${column.className || ""}">
                  ${column.sortable ? `
                    <button
                      class="flex items-center gap-x-2 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors sort-btn text-left"
                      data-column="${column.key}"
                      data-sort-type="${column.sortType || "string"}"
                      data-sort-direction="none"
                      onclick="sortTable('${tableId}', '${column.key}', '${column.sortType || "string"}')"
                    >
                      <span>${column.label}</span>
                      <div class="sort-icons flex flex-col">
                        <svg class="w-3 h-3 sort-up opacity-30" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                        </svg>
                        <svg class="w-3 h-3 sort-down opacity-30 -mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </button>
                  ` : column.label}
                </th>
              `;
  }).join("")}
            </tr>
          </thead>
          <tbody>
            ${data.rows.map((row, rowIndex) => {
    if (!row) return "";
    const clickableClass = data.rowClickable ? "cursor-pointer" : "";
    const clickHandler = data.rowClickable && data.rowClickUrl ? `onclick="window.location.href='${data.rowClickUrl(row)}'"` : "";
    return `
                <tr class="group border-t border-zinc-950/5 dark:border-white/5 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:via-blue-50/30 hover:to-purple-50/50 dark:hover:from-cyan-900/20 dark:hover:via-blue-900/10 dark:hover:to-purple-900/20 hover:shadow-sm hover:shadow-cyan-500/5 dark:hover:shadow-cyan-400/5 transition-all duration-300 ${clickableClass}" ${clickHandler}>
                  ${data.selectable ? `
                    <td class="px-4 py-4 sm:pl-0" onclick="event.stopPropagation()">
                      <div class="flex items-center justify-center">
                        <div class="group grid size-4 grid-cols-1">
                          <input type="checkbox" value="${row.id || ""}" class="col-start-1 row-start-1 appearance-none rounded border border-white/10 bg-white/5 checked:border-cyan-500 checked:bg-cyan-500 indeterminate:border-cyan-500 indeterminate:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:border-white/5 disabled:bg-white/10 disabled:checked:bg-white/10 forced-colors:appearance-auto row-checkbox" />
                          <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-white/25">
                            <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                            <path d="M3 7H11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:indeterminate]:opacity-100" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  ` : ""}
                  ${data.columns.map((column, colIndex) => {
      const value = row[column.key];
      const displayValue = column.render ? column.render(value, row) : value;
      const stopPropagation = column.key === "actions" ? 'onclick="event.stopPropagation()"' : "";
      const isFirst = colIndex === 0 && !data.selectable;
      const isLast = colIndex === data.columns.length - 1;
      return `
                      <td class="px-4 py-4 text-sm text-zinc-500 dark:text-zinc-400 ${isFirst ? "sm:pl-0 font-medium text-zinc-950 dark:text-white" : ""} ${isLast ? "sm:pr-0" : ""} ${column.className || ""}" ${stopPropagation}>
                        ${displayValue || ""}
                      </td>
                    `;
    }).join("")}
                </tr>
              `;
  }).join("")}
          </tbody>
        </table>
      </div>

      <script>
        // Table sorting functionality
        window.sortTable = function(tableId, column, sortType) {
          const tableContainer = document.getElementById(tableId);
          const table = tableContainer.querySelector('.sortable-table');
          const tbody = table.querySelector('tbody');
          const rows = Array.from(tbody.querySelectorAll('tr'));
          const headerBtn = table.querySelector(\`[data-column="\${column}"]\`);

          // Get current sort direction
          let direction = headerBtn.getAttribute('data-sort-direction');

          // Reset all sort indicators
          table.querySelectorAll('.sort-btn').forEach(btn => {
            btn.setAttribute('data-sort-direction', 'none');
            btn.querySelectorAll('.sort-up, .sort-down').forEach(icon => {
              icon.classList.add('opacity-30');
              icon.classList.remove('opacity-100', 'text-zinc-950', 'dark:text-white');
            });
          });

          // Determine new direction
          if (direction === 'none' || direction === 'desc') {
            direction = 'asc';
          } else {
            direction = 'desc';
          }

          // Update current header
          headerBtn.setAttribute('data-sort-direction', direction);
          const upIcon = headerBtn.querySelector('.sort-up');
          const downIcon = headerBtn.querySelector('.sort-down');

          if (direction === 'asc') {
            upIcon.classList.remove('opacity-30');
            upIcon.classList.add('opacity-100', 'text-zinc-950', 'dark:text-white');
            downIcon.classList.add('opacity-30');
            downIcon.classList.remove('opacity-100', 'text-zinc-950', 'dark:text-white');
          } else {
            downIcon.classList.remove('opacity-30');
            downIcon.classList.add('opacity-100', 'text-zinc-950', 'dark:text-white');
            upIcon.classList.add('opacity-30');
            upIcon.classList.remove('opacity-100', 'text-zinc-950', 'dark:text-white');
          }

          // Find column index (accounting for potential select column)
          const headers = Array.from(table.querySelectorAll('th'));
          const selectableOffset = table.querySelector('input[id^="select-all"]') ? 1 : 0;
          const columnIndex = headers.findIndex(th => th.querySelector(\`[data-column="\${column}"]\`)) - selectableOffset;

          // Sort rows
          rows.sort((a, b) => {
            const aCell = a.children[columnIndex + selectableOffset];
            const bCell = b.children[columnIndex + selectableOffset];

            if (!aCell || !bCell) return 0;

            let aValue = aCell.textContent.trim();
            let bValue = bCell.textContent.trim();

            // Handle different sort types
            switch (sortType) {
              case 'number':
                aValue = parseFloat(aValue.replace(/[^0-9.-]/g, '')) || 0;
                bValue = parseFloat(bValue.replace(/[^0-9.-]/g, '')) || 0;
                break;
              case 'date':
                aValue = new Date(aValue).getTime() || 0;
                bValue = new Date(bValue).getTime() || 0;
                break;
              case 'boolean':
                aValue = aValue.toLowerCase() === 'true' || aValue.toLowerCase() === 'published' || aValue.toLowerCase() === 'active';
                bValue = bValue.toLowerCase() === 'true' || bValue.toLowerCase() === 'published' || bValue.toLowerCase() === 'active';
                break;
              default: // string
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
          });

          // Re-append sorted rows
          rows.forEach(row => tbody.appendChild(row));
        };

        // Select all functionality
        document.addEventListener('DOMContentLoaded', function() {
          document.querySelectorAll('[id^="select-all"]').forEach(selectAll => {
            selectAll.addEventListener('change', function() {
              const tableId = this.id.replace('select-all-', '');
              const table = document.getElementById(tableId);
              if (table) {
                const checkboxes = table.querySelectorAll('.row-checkbox');
                checkboxes.forEach(checkbox => {
                  checkbox.checked = this.checked;
                });
              }
            });
          });
        });
      </script>
    </div>
  `;
}

// src/templates/components/pagination.template.ts
function renderPagination(data) {
  const shouldShowPagination = data.totalPages > 1 || data.showPageSizeSelector !== false && data.totalItems > 0;
  if (!shouldShowPagination) {
    return "";
  }
  const buildUrl = (page, limit) => {
    const params = new URLSearchParams(data.queryParams || {});
    params.set("page", page.toString());
    if (data.itemsPerPage !== 20) {
      params.set("limit", data.itemsPerPage.toString());
    }
    return `${data.baseUrl}?${params.toString()}`;
  };
  const buildPageSizeUrl = (limit) => {
    const params = new URLSearchParams(data.queryParams || {});
    params.set("page", "1");
    params.set("limit", limit.toString());
    return `${data.baseUrl}?${params.toString()}`;
  };
  const generatePageNumbers = () => {
    const maxNumbers = data.maxPageNumbers || 5;
    const half = Math.floor(maxNumbers / 2);
    let start = Math.max(1, data.currentPage - half);
    let end = Math.min(data.totalPages, start + maxNumbers - 1);
    if (end - start + 1 < maxNumbers) {
      start = Math.max(1, end - maxNumbers + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };
  return `
    <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 px-4 py-3 flex items-center justify-between mt-4">
      ${data.totalPages > 1 ? `
        <!-- Mobile Pagination -->
        <div class="flex-1 flex justify-between sm:hidden">
          ${data.currentPage > 1 ? `
            <a href="${buildUrl(data.currentPage - 1)}" class="inline-flex items-center rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Previous
            </a>
          ` : `
            <span class="inline-flex items-center rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-400 dark:text-zinc-600 shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 opacity-50 cursor-not-allowed">Previous</span>
          `}

          ${data.currentPage < data.totalPages ? `
            <a href="${buildUrl(data.currentPage + 1)}" class="inline-flex items-center rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Next
            </a>
          ` : `
            <span class="inline-flex items-center rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-400 dark:text-zinc-600 shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 opacity-50 cursor-not-allowed">Next</span>
          `}
        </div>
      ` : ""}

      <!-- Desktop Pagination -->
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            Showing <span class="font-medium text-zinc-950 dark:text-white">${data.startItem}</span> to
            <span class="font-medium text-zinc-950 dark:text-white">${data.endItem}</span> of
            <span class="font-medium text-zinc-950 dark:text-white">${data.totalItems}</span> results
          </p>
          ${data.showPageSizeSelector !== false ? `
            <div class="flex items-center gap-2">
              <label for="page-size" class="text-sm text-zinc-500 dark:text-zinc-400">Per page:</label>
              <div class="grid grid-cols-1">
                <select
                  id="page-size"
                  onchange="window.location.href = this.value"
                  class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 pl-3 pr-8 text-sm text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-zinc-500/30 dark:outline-zinc-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400"
                >
                  ${(data.pageSizeOptions || [10, 20, 50, 100]).map((size) => `
                    <option value="${buildPageSizeUrl(size)}" ${size === data.itemsPerPage ? "selected" : ""}>
                      ${size}
                    </option>
                  `).join("")}
                </select>
                <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-zinc-600 dark:text-zinc-400">
                  <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
              </div>
            </div>
          ` : ""}
        </div>

        ${data.totalPages > 1 ? `
          <div class="flex items-center gap-x-1">
            <!-- Previous Button -->
            ${data.currentPage > 1 ? `
            <a href="${buildUrl(data.currentPage - 1)}"
               class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Previous
            </a>
          ` : ""}

          <!-- Page Numbers -->
          ${data.showPageNumbers !== false ? `
            <!-- First page if not in range -->
            ${(() => {
    const pageNumbers = generatePageNumbers();
    const firstPage = pageNumbers.length > 0 ? pageNumbers[0] : null;
    return firstPage && firstPage > 1 ? `
                <a href="${buildUrl(1)}"
                   class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  1
                </a>
                ${firstPage > 2 ? `
                  <span class="px-2 text-sm text-zinc-500 dark:text-zinc-400">...</span>
                ` : ""}
              ` : "";
  })()}

            <!-- Page number buttons -->
            ${generatePageNumbers().map((pageNum) => `
              ${pageNum === data.currentPage ? `
                <span class="rounded-lg bg-zinc-950 dark:bg-white px-3 py-2 text-sm font-semibold text-white dark:text-zinc-950">
                  ${pageNum}
                </span>
              ` : `
                <a href="${buildUrl(pageNum)}"
                   class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  ${pageNum}
                </a>
              `}
            `).join("")}

            <!-- Last page if not in range -->
            ${(() => {
    const pageNumbers = generatePageNumbers();
    const lastPageNum = pageNumbers.length > 0 ? pageNumbers.slice(-1)[0] : null;
    return lastPageNum && lastPageNum < data.totalPages ? `
                ${lastPageNum < data.totalPages - 1 ? `
                  <span class="px-2 text-sm text-zinc-500 dark:text-zinc-400">...</span>
                ` : ""}
                <a href="${buildUrl(data.totalPages)}"
                   class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  ${data.totalPages}
                </a>
              ` : "";
  })()}
          ` : ""}

          <!-- Next Button -->
          ${data.currentPage < data.totalPages ? `
            <a href="${buildUrl(data.currentPage + 1)}"
               class="rounded-lg bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-950 dark:text-white shadow-sm ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              Next
            </a>
          ` : ""}
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

// src/templates/pages/admin-content-list.template.ts
function renderContentListPage(data) {
  const urlParams = new URLSearchParams();
  if (data.modelName && data.modelName !== "all") urlParams.set("model", data.modelName);
  if (data.status && data.status !== "all") urlParams.set("status", data.status);
  if (data.search) urlParams.set("search", data.search);
  if (data.page && data.page !== 1) urlParams.set("page", data.page.toString());
  const currentParams = urlParams.toString();
  const hasActiveFilters = data.modelName !== "all" || data.status !== "all" || !!data.search;
  const filterBarData = {
    filters: [
      {
        name: "model",
        label: "Model",
        options: [
          { value: "all", label: "All Models", selected: data.modelName === "all" },
          ...data.models.map((model) => ({
            value: model.name,
            label: model.displayName,
            selected: data.modelName === model.name
          }))
        ]
      },
      {
        name: "status",
        label: "Status",
        options: [
          { value: "all", label: "All Status", selected: data.status === "all" },
          { value: "draft", label: "Draft", selected: data.status === "draft" },
          { value: "review", label: "Under Review", selected: data.status === "review" },
          { value: "scheduled", label: "Scheduled", selected: data.status === "scheduled" },
          { value: "published", label: "Published", selected: data.status === "published" },
          { value: "archived", label: "Archived", selected: data.status === "archived" },
          { value: "deleted", label: "Deleted", selected: data.status === "deleted" }
        ]
      }
    ],
    actions: [
      {
        label: "Refresh",
        className: "btn-secondary",
        onclick: "location.reload()"
      }
    ],
    bulkActions: [
      { label: "Publish", value: "publish", icon: "check-circle" },
      { label: "Unpublish", value: "unpublish", icon: "x-circle" },
      { label: "Delete", value: "delete", icon: "trash", className: "text-pink-600" }
    ]
  };
  const tableColumns = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      sortType: "string",
      render: (value, row) => `
        <div class="flex items-center">
          <div>
            <div class="text-sm font-medium text-zinc-950 dark:text-white">
              <a href="/content/${row.id}" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">${row.title}</a>
            </div>
            <div class="text-sm text-zinc-500 dark:text-zinc-400">${row.slug}</div>
          </div>
        </div>
      `
    },
    {
      key: "modelName",
      label: "Model",
      sortable: true,
      sortType: "string",
      className: "text-sm text-zinc-500 dark:text-zinc-400"
    },
    {
      key: "statusBadge",
      label: "Status",
      sortable: true,
      sortType: "string",
      render: (value) => value
    },
    {
      key: "authorName",
      label: "Author",
      sortable: true,
      sortType: "string",
      className: "text-sm text-zinc-500 dark:text-zinc-400"
    },
    {
      key: "formattedDate",
      label: "Updated",
      sortable: true,
      sortType: "date",
      className: "text-sm text-zinc-500 dark:text-zinc-400"
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      className: "text-sm font-medium",
      render: (value, row) => `
        <div class="flex space-x-2">
          <button
            class="inline-flex items-center justify-center p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 ring-1 ring-inset ring-cyan-600/20 dark:ring-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"
            onclick="window.location.href='/admin/content/${row.id}/edit${currentParams ? `?ref=${encodeURIComponent(currentParams)}` : ""}'"
            title="Edit"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
          <button
            class="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            hx-delete="/admin/content/${row.id}"
            hx-confirm="Are you sure you want to delete this content item?"
            hx-target="#content-list"
            hx-swap="outerHTML"
            title="Delete"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      `
    }
  ];
  const tableData = {
    tableId: "content-table",
    columns: tableColumns,
    rows: data.contentItems,
    selectable: true,
    rowClickable: true,
    rowClickUrl: (row) => `/admin/content/${row.id}/edit${currentParams ? `?ref=${encodeURIComponent(currentParams)}` : ""}`,
    emptyMessage: "No content found. Create your first content item to get started."
  };
  const totalPages = Math.ceil(data.totalItems / data.itemsPerPage);
  const startItem = (data.page - 1) * data.itemsPerPage + 1;
  const endItem = Math.min(data.page * data.itemsPerPage, data.totalItems);
  const paginationData = {
    currentPage: data.page,
    totalPages,
    totalItems: data.totalItems,
    itemsPerPage: data.itemsPerPage,
    startItem,
    endItem,
    baseUrl: "/admin/content",
    queryParams: {
      model: data.modelName,
      status: data.status,
      ...data.search ? { search: data.search } : {}
    },
    showPageSizeSelector: true,
    pageSizeOptions: [10, 20, 50, 100]
  };
  const pageContent = `
    <div>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">Content Management</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">Manage and organize your content items</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/content/new" class="inline-flex items-center justify-center rounded-lg bg-zinc-950 dark:bg-white px-3.5 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Content
          </a>
        </div>
      </div>
      <!-- Filters -->
      <div class="relative rounded-xl mb-6">
        <!-- Gradient Background -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 dark:from-cyan-400/20 dark:via-blue-400/20 dark:to-purple-400/20 rounded-xl"></div>

        <div class="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 rounded-xl">
          <div class="px-6 py-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <!-- Search Input -->
                <div>
                  <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Search</label>
                  <form onsubmit="performContentSearch(event)" class="flex items-center space-x-2">
                    <div class="relative group">
                      <input
                        type="text"
                        name="search"
                        id="content-search-input"
                        value="${data.search || ""}"
                        oninput="toggleContentClearButton()"
                        placeholder="Search content..."
                        class="rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-4 py-2.5 pl-11 pr-10 text-sm w-72 text-zinc-950 dark:text-white border-2 border-cyan-200/50 dark:border-cyan-700/50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-zinc-800 focus:shadow-lg focus:shadow-cyan-500/20 dark:focus:shadow-cyan-400/20 transition-all duration-300"
                      >
                      <div class="absolute left-3.5 top-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-300 dark:to-blue-400 opacity-90 group-focus-within:opacity-100 transition-opacity">
                        <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                      </div>
                      <button
                        type="button"
                        id="clear-content-search"
                        onclick="clearContentSearch()"
                        class="${data.search ? "" : "hidden"} absolute right-3 top-3 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-400/20 dark:bg-zinc-500/20 hover:bg-zinc-400/30 dark:hover:bg-zinc-500/30 transition-colors"
                      >
                        <svg class="h-3 w-3 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                    <button
                      type="submit"
                      class="inline-flex items-center gap-x-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 text-white text-sm font-medium rounded-full hover:from-cyan-600 hover:to-blue-600 dark:hover:from-cyan-500 dark:hover:to-blue-500 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                      Search
                    </button>
                  </form>
                  <script>
                    function performContentSearch(event) {
                      event.preventDefault();
                      const searchInput = document.getElementById('content-search-input');
                      const value = searchInput.value.trim();
                      const params = new URLSearchParams(window.location.search);
                      if (value) {
                        params.set('search', value);
                      } else {
                        params.delete('search');
                      }
                      params.set('page', '1');
                      window.location.href = window.location.pathname + '?' + params.toString();
                    }

                    function clearContentSearch() {
                      const params = new URLSearchParams(window.location.search);
                      params.delete('search');
                      params.set('page', '1');
                      window.location.href = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
                    }

                    function toggleContentClearButton() {
                      const searchInput = document.getElementById('content-search-input');
                      const clearButton = document.getElementById('clear-content-search');
                      if (searchInput.value.trim()) {
                        clearButton.classList.remove('hidden');
                      } else {
                        clearButton.classList.add('hidden');
                      }
                    }

                    function updateContentFilters(filterName, filterValue) {
                      const params = new URLSearchParams(window.location.search);
                      params.set(filterName, filterValue);
                      params.set('page', '1');
                      window.location.href = window.location.pathname + '?' + params.toString();
                    }

                    function clearAllFilters() {
                      window.location.href = window.location.pathname;
                    }
                  </script>
                </div>

                ${filterBarData.filters.map((filter) => {
    const selectedOption = filter.options.find((opt) => opt.selected);
    const selectedColor = selectedOption?.color || "cyan";
    const colorMap = {
      "cyan": "bg-cyan-400 dark:bg-cyan-400",
      "lime": "bg-lime-400 dark:bg-lime-400",
      "pink": "bg-pink-400 dark:bg-pink-400",
      "purple": "bg-purple-400 dark:bg-purple-400",
      "amber": "bg-amber-400 dark:bg-amber-400",
      "zinc": "bg-zinc-400 dark:bg-zinc-400"
    };
    return `
                  <div>
                    <label class="block text-sm/6 font-medium text-zinc-950 dark:text-white">${filter.label}</label>
                    <div class="mt-2 grid grid-cols-1">
                      <div class="col-start-1 row-start-1 flex items-center gap-3 pl-3 pr-8 pointer-events-none">
                        ${filter.name === "status" ? `<span class="inline-block size-2 shrink-0 rounded-full border border-transparent ${colorMap[selectedColor]}"></span>` : ""}
                      </div>
                      <select
                        name="${filter.name}"
                        onchange="updateContentFilters('${filter.name}', this.value)"
                        class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 dark:bg-white/5 py-1.5 ${filter.name === "status" ? "pl-8" : "pl-3"} pr-8 text-base text-zinc-950 dark:text-white outline outline-1 -outline-offset-1 outline-cyan-500/30 dark:outline-cyan-400/30 *:bg-white dark:*:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-500 dark:focus-visible:outline-cyan-400 sm:text-sm/6 min-w-48"
                      >
                        ${filter.options.map((opt) => `
                          <option value="${opt.value}" ${opt.selected ? "selected" : ""}>${opt.label}</option>
                        `).join("")}
                      </select>
                      <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-cyan-600 dark:text-cyan-400 sm:size-4">
                        <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                `;
  }).join("")}

                <!-- Clear Filters Button -->
                ${hasActiveFilters ? `
                  <div>
                    <label class="block text-sm/6 font-medium text-zinc-950 dark:text-white mb-2">&nbsp;</label>
                    <button
                      onclick="clearAllFilters()"
                      class="inline-flex items-center gap-x-1.5 px-3 py-2 bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 text-sm font-medium rounded-md ring-1 ring-inset ring-pink-600/20 dark:ring-pink-500/20 hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-colors"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      Clear Filters
                    </button>
                  </div>
                ` : ""}
              </div>
              <div class="flex items-center gap-x-3">
                <span class="text-sm/6 font-medium text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm">${data.totalItems} ${data.totalItems === 1 ? "item" : "items"}</span>
                ${filterBarData.actions?.map((action) => `
                  <button
                    ${action.onclick ? `onclick="${action.onclick}"` : ""}
                    ${action.hxGet ? `hx-get="${action.hxGet}"` : ""}
                    ${action.hxTarget ? `hx-target="${action.hxTarget}"` : ""}
                    class="inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-zinc-950 dark:text-white text-sm font-medium rounded-full ring-1 ring-inset ring-cyan-200/50 dark:ring-cyan-700/50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30 hover:ring-cyan-300 dark:hover:ring-cyan-600 transition-all duration-200"
                  >
                    ${action.label === "Refresh" ? `
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    ` : ""}
                    ${action.label}
                  </button>
                `).join("") || ""}
                ${filterBarData.bulkActions && filterBarData.bulkActions.length > 0 ? `
                  <div class="relative inline-block" id="bulk-actions-dropdown">
                    <button
                      id="bulk-actions-btn"
                      onclick="toggleBulkActionsDropdown()"
                      class="inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-zinc-100/60 dark:bg-zinc-800/60 backdrop-blur-sm text-zinc-400 dark:text-zinc-600 text-sm font-medium rounded-full ring-1 ring-inset ring-zinc-200/50 dark:ring-zinc-700/50 cursor-not-allowed"
                      disabled
                    >
                      Bulk Actions
                      <svg viewBox="0 0 20 20" fill="currentColor" class="size-4">
                        <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                      </svg>
                    </button>

                    <div
                      id="bulk-actions-menu"
                      class="hidden absolute right-0 mt-2 w-56 origin-top-right divide-y divide-zinc-200 dark:divide-white/10 rounded-lg bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-zinc-950/5 dark:ring-white/10 z-50 transition-all duration-100 scale-95 opacity-0"
                      style="transition-behavior: allow-discrete;"
                    >
                      <div class="py-1">
                        <button
                          onclick="performBulkAction('publish')"
                          class="group/item flex w-full items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white transition-colors"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" class="mr-3 size-5 text-zinc-400 dark:text-zinc-500 group-hover/item:text-zinc-950 dark:group-hover/item:text-white">
                            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                          </svg>
                          Publish Selected
                        </button>
                        <button
                          onclick="performBulkAction('draft')"
                          class="group/item flex w-full items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white transition-colors"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" class="mr-3 size-5 text-zinc-400 dark:text-zinc-500 group-hover/item:text-zinc-950 dark:group-hover/item:text-white">
                            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                          </svg>
                          Move to Draft
                        </button>
                      </div>
                      <div class="py-1">
                        <button
                          onclick="performBulkAction('delete')"
                          class="group/item flex w-full items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" class="mr-3 size-5 text-zinc-400 dark:text-zinc-500 group-hover/item:text-red-600 dark:group-hover/item:text-red-400">
                            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" fill-rule="evenodd" />
                          </svg>
                          Delete Selected
                        </button>
                      </div>
                    </div>
                  </div>
                ` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Content List -->
      <div id="content-list">
        ${renderTable(tableData)}
        ${renderPagination(paginationData)}
      </div>
      
    </div>
    
    <!-- Modals -->
    <div id="bulk-actions-modal"></div>
    <div id="versions-modal"></div>
    
    <script>
      // Update bulk actions button state
      function updateBulkActionsButton() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"].row-checkbox');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const btn = document.getElementById('bulk-actions-btn');
        const menu = document.getElementById('bulk-actions-menu');

        if (!btn) return;

        if (checkedCount > 0) {
          btn.disabled = false;
          btn.className = 'inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-zinc-950 dark:text-white text-sm font-medium rounded-full ring-1 ring-inset ring-cyan-200/50 dark:ring-cyan-700/50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30 hover:ring-cyan-300 dark:hover:ring-cyan-600 transition-all duration-200';
        } else {
          btn.disabled = true;
          btn.className = 'inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-zinc-100/60 dark:bg-zinc-800/60 backdrop-blur-sm text-zinc-400 dark:text-zinc-600 text-sm font-medium rounded-full ring-1 ring-inset ring-zinc-200/50 dark:ring-zinc-700/50 cursor-not-allowed';
          // Hide menu when no items selected
          if (menu) {
            menu.classList.remove('scale-100', 'opacity-100');
            menu.classList.add('scale-95', 'opacity-0', 'hidden');
          }
        }
      }

      // Select all functionality
      document.addEventListener('change', function(e) {
        if (e.target.id === 'select-all') {
          const checkboxes = document.querySelectorAll('.row-checkbox');
          checkboxes.forEach(cb => cb.checked = e.target.checked);
          updateBulkActionsButton();
        } else if (e.target.classList.contains('row-checkbox')) {
          updateBulkActionsButton();
        }
      });

      // Initialize button state on page load
      document.addEventListener('DOMContentLoaded', function() {
        updateBulkActionsButton();
      });

      // Toggle bulk actions dropdown
      function toggleBulkActionsDropdown() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"].row-checkbox');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

        if (checkedCount === 0) return;

        const menu = document.getElementById('bulk-actions-menu');
        const isHidden = menu.classList.contains('hidden');

        if (isHidden) {
          menu.classList.remove('hidden');
          setTimeout(() => {
            menu.classList.remove('scale-95', 'opacity-0');
            menu.classList.add('scale-100', 'opacity-100');
          }, 10);
        } else {
          menu.classList.remove('scale-100', 'opacity-100');
          menu.classList.add('scale-95', 'opacity-0');
          setTimeout(() => {
            menu.classList.add('hidden');
          }, 100);
        }
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('bulk-actions-dropdown');
        const menu = document.getElementById('bulk-actions-menu');
        if (dropdown && menu && !dropdown.contains(e.target)) {
          menu.classList.remove('scale-100', 'opacity-100');
          menu.classList.add('scale-95', 'opacity-0');
          setTimeout(() => {
            menu.classList.add('hidden');
          }, 100);
        }
      });

      // Store current bulk action context
      let currentBulkAction = null;
      let currentSelectedIds = [];

      // Perform bulk action
      function performBulkAction(action) {
        const selectedIds = Array.from(document.querySelectorAll('input[type="checkbox"].row-checkbox:checked'))
          .map(cb => cb.value)
          .filter(id => id);

        if (selectedIds.length === 0) {
          alert('Please select at least one item');
          return;
        }

        // Store context for confirmation
        currentBulkAction = action;
        currentSelectedIds = selectedIds;

        // Update dialog content based on action
        updateDialogContent(action, selectedIds.length);

        // Show confirmation dialog
        showConfirmDialog('bulk-action-confirm');
      }

      // Update dialog content dynamically
      function updateDialogContent(action, count) {
        const dialog = document.getElementById('bulk-action-confirm');
        const titleEl = dialog.querySelector('h3');
        const messageEl = dialog.querySelector('p');
        const confirmBtn = dialog.querySelector('.confirm-button');

        let title, message, btnText, btnClass;

        switch(action) {
          case 'delete':
            title = 'Confirm Bulk Delete';
            message = 'Are you sure you want to delete ' + count + ' selected item' + (count > 1 ? 's' : '') + '? This action cannot be undone.';
            btnText = 'Delete';
            btnClass = 'bg-red-500 hover:bg-red-400';
            break;
          case 'publish':
            title = 'Confirm Bulk Publish';
            message = 'Are you sure you want to publish ' + count + ' selected item' + (count > 1 ? 's' : '') + '? They will become publicly visible.';
            btnText = 'Publish';
            btnClass = 'bg-green-500 hover:bg-green-400';
            break;
          case 'draft':
            title = 'Confirm Bulk Draft';
            message = 'Are you sure you want to move ' + count + ' selected item' + (count > 1 ? 's' : '') + ' to draft status? They will be unpublished.';
            btnText = 'Move to Draft';
            btnClass = 'bg-blue-500 hover:bg-blue-400';
            break;
          default:
            title = 'Confirm Bulk Action';
            message = 'Are you sure you want to perform this action on ' + count + ' selected item' + (count > 1 ? 's' : '') + '?';
            btnText = 'Confirm';
            btnClass = 'bg-blue-500 hover:bg-blue-400';
        }

        titleEl.textContent = title;
        messageEl.textContent = message;
        confirmBtn.textContent = btnText;
        confirmBtn.className = confirmBtn.className.replace(/bg-w+-d+s+hover:bg-w+-d+/, btnClass);
      }

      // Execute the bulk action after confirmation
      function executeBulkAction() {
        if (!currentBulkAction || currentSelectedIds.length === 0) return;

        // Close dropdown
        const menu = document.getElementById('bulk-actions-menu');
        menu.classList.add('hidden');

        fetch('/admin/content/bulk-action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: currentBulkAction,
            ids: currentSelectedIds
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            location.reload();
          } else {
            alert('Error: ' + (data.error || 'Unknown error'));
          }
        })
        .catch(err => {
          console.error('Bulk action error:', err);
          alert('Failed to perform bulk action');
        })
        .finally(() => {
          // Clear context
          currentBulkAction = null;
          currentSelectedIds = [];
        });
      }

      // Helper to get action text for display
      function getActionText(action) {
        const actionCount = currentSelectedIds.length;
        switch(action) {
          case 'publish':
            return \`publish \${actionCount} item\${actionCount > 1 ? 's' : ''}\`;
          case 'draft':
            return \`move \${actionCount} item\${actionCount > 1 ? 's' : ''} to draft\`;
          case 'delete':
            return \`delete \${actionCount} item\${actionCount > 1 ? 's' : ''}\`;
          default:
            return \`perform action on \${actionCount} item\${actionCount > 1 ? 's' : ''}\`;
        }
      }

    </script>

    <!-- Confirmation Dialog for Bulk Actions -->
    ${renderConfirmationDialog({
    id: "bulk-action-confirm",
    title: "Confirm Bulk Action",
    message: "Are you sure you want to perform this action? This operation will affect multiple items.",
    confirmText: "Confirm",
    cancelText: "Cancel",
    confirmClass: "bg-blue-500 hover:bg-blue-400",
    iconColor: "blue",
    onConfirm: "executeBulkAction()"
  })}

    <!-- Confirmation Dialog Script -->
    ${getConfirmationDialogScript()}
  `;
  const layoutData = {
    title: "Content Management",
    currentPath: "/admin/content",
    user: data.user,
    version: data.version,
    content: pageContent
  };
  return renderAdminLayoutCatalyst(layoutData);
}

// src/templates/components/version-history.template.ts
function renderVersionHistory(data) {
  return `
    <div class="version-history-modal">
      <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="relative px-6 py-4 border-b border-white/10">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div class="relative flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Version History</h3>
            <button onclick="closeVersionHistory()" class="text-gray-300 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Versions List -->
        <div class="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="p-6 space-y-4">
            ${data.versions.map((version, index) => `
              <div class="version-item backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 p-4 ${version.is_current ? "ring-2 ring-blue-500/50" : ""}">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-3">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${version.is_current ? "bg-blue-500/20 text-blue-300" : "bg-white/10 text-gray-300"}">
                      Version ${version.version}${version.is_current ? " (Current)" : ""}
                    </span>
                    <span class="text-sm text-gray-300">
                      ${new Date(version.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    ${!version.is_current ? `
                      <button 
                        onclick="restoreVersion('${data.contentId}', ${version.version})"
                        class="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 transition-all"
                      >
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                        </svg>
                        Restore
                      </button>
                    ` : ""}
                    <button 
                      onclick="previewVersion('${data.contentId}', ${version.version})"
                      class="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-all"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      Preview
                    </button>
                  </div>
                </div>
                
                <!-- Version Summary -->
                <div class="version-summary text-sm">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span class="text-gray-400">Title:</span>
                      <span class="text-white ml-2">${escapeHtml2(version.data?.title || "Untitled")}</span>
                    </div>
                    <div>
                      <span class="text-gray-400">Author:</span>
                      <span class="text-white ml-2">${escapeHtml2(version.author_name || "Unknown")}</span>
                    </div>
                    ${version.data?.excerpt ? `
                      <div class="md:col-span-2">
                        <span class="text-gray-400">Excerpt:</span>
                        <p class="text-white mt-1 text-xs">${escapeHtml2(version.data.excerpt.substring(0, 200))}${version.data.excerpt.length > 200 ? "..." : ""}</p>
                      </div>
                    ` : ""}
                  </div>
                </div>
                
                <!-- Changes Summary (if not current) -->
                ${!version.is_current && index < data.versions.length - 1 ? `
                  <div class="mt-3 pt-3 border-t border-white/10">
                    <button 
                      onclick="toggleChanges('changes-${version.version}')"
                      class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                      </svg>
                      View Changes
                    </button>
                    <div id="changes-${version.version}" class="hidden mt-2 text-xs text-gray-300">
                      <em>Change detection coming soon...</em>
                    </div>
                  </div>
                ` : ""}
              </div>
            `).join("")}
          </div>
        </div>
        
        <!-- Footer -->
        <div class="px-6 py-4 border-t border-white/10 bg-white/5">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">
              ${data.versions.length} version${data.versions.length !== 1 ? "s" : ""} total
            </span>
            <button 
              onclick="closeVersionHistory()"
              class="px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <script>
      function closeVersionHistory() {
        document.querySelector('.version-history-modal').closest('.fixed').remove();
      }
      
      function restoreVersion(contentId, version) {
        if (confirm(\`Are you sure you want to restore to version \${version}? This will create a new version with the restored content.\`)) {
          fetch(\`/admin/content/\${contentId}/restore/\${version}\`, {
            method: 'POST'
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              showNotification('Version restored successfully! Refreshing page...', 'success');
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } else {
              showNotification('Failed to restore version', 'error');
            }
          })
          .catch(error => {
            console.error('Error restoring version:', error);
            showNotification('Error restoring version', 'error');
          });
        }
      }
      
      function previewVersion(contentId, version) {
        const preview = window.open('', '_blank');
        preview.document.write('<p>Loading version preview...</p>');
        
        fetch(\`/admin/content/\${contentId}/version/\${version}/preview\`)
        .then(response => response.text())
        .then(html => {
          preview.document.open();
          preview.document.write(html);
          preview.document.close();
        })
        .catch(error => {
          preview.document.write('<p>Error loading preview</p>');
        });
      }
      
      function toggleChanges(elementId) {
        const element = document.getElementById(elementId);
        element.classList.toggle('hidden');
      }
    </script>
  `;
}
function escapeHtml2(text) {
  if (typeof text !== "string") return String(text || "");
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char] || char);
}

// src/routes/admin-content.ts
var adminContentRoutes = new hono.Hono();
async function getCollectionFields(db, collectionId) {
  const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.collection);
  return cache.getOrSet(
    cache.generateKey("fields", collectionId),
    async () => {
      const stmt = db.prepare(`
        SELECT * FROM content_fields
        WHERE collection_id = ?
        ORDER BY field_order ASC
      `);
      const { results } = await stmt.bind(collectionId).all();
      return (results || []).map((row) => ({
        id: row.id,
        field_name: row.field_name,
        field_type: row.field_type,
        field_label: row.field_label,
        field_options: row.field_options ? JSON.parse(row.field_options) : {},
        field_order: row.field_order,
        is_required: row.is_required === 1,
        is_searchable: row.is_searchable === 1
      }));
    }
  );
}
async function getCollection(db, collectionId) {
  const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.collection);
  return cache.getOrSet(
    cache.generateKey("collection", collectionId),
    async () => {
      const stmt = db.prepare("SELECT * FROM collections WHERE id = ? AND is_active = 1");
      const collection = await stmt.bind(collectionId).first();
      if (!collection) return null;
      return {
        id: collection.id,
        name: collection.name,
        display_name: collection.display_name,
        description: collection.description,
        schema: collection.schema ? JSON.parse(collection.schema) : {}
      };
    }
  );
}
adminContentRoutes.get("/", async (c) => {
  try {
    const user = c.get("user");
    const url = new URL(c.req.url);
    const db = c.env.DB;
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const modelName = url.searchParams.get("model") || "all";
    const status = url.searchParams.get("status") || "all";
    const search = url.searchParams.get("search") || "";
    const offset = (page - 1) * limit;
    const collectionsStmt = db.prepare("SELECT id, name, display_name FROM collections WHERE is_active = 1 ORDER BY display_name");
    const { results: collectionsResults } = await collectionsStmt.all();
    const models = (collectionsResults || []).map((row) => ({
      name: row.name,
      displayName: row.display_name
    }));
    const conditions = [];
    const params = [];
    if (status !== "deleted") {
      conditions.push("c.status != 'deleted'");
    }
    if (search) {
      conditions.push("(c.title LIKE ? OR c.slug LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (modelName !== "all") {
      conditions.push("col.name = ?");
      params.push(modelName);
    }
    if (status !== "all" && status !== "deleted") {
      conditions.push("c.status = ?");
      params.push(status);
    } else if (status === "deleted") {
      conditions.push("c.status = 'deleted'");
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM content c
      JOIN collections col ON c.collection_id = col.id
      ${whereClause}
    `);
    const countResult = await countStmt.bind(...params).first();
    const totalItems = countResult?.count || 0;
    const contentStmt = db.prepare(`
      SELECT c.id, c.title, c.slug, c.status, c.created_at, c.updated_at,
             col.name as collection_name, col.display_name as collection_display_name,
             u.first_name, u.last_name, u.email as author_email
      FROM content c
      JOIN collections col ON c.collection_id = col.id
      LEFT JOIN users u ON c.author_id = u.id
      ${whereClause}
      ORDER BY c.updated_at DESC
      LIMIT ? OFFSET ?
    `);
    const { results } = await contentStmt.bind(...params, limit, offset).all();
    const contentItems = (results || []).map((row) => {
      const statusConfig = {
        draft: {
          class: "bg-zinc-50 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 ring-1 ring-inset ring-zinc-600/20 dark:ring-zinc-500/20",
          text: "Draft"
        },
        review: {
          class: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/20",
          text: "Under Review"
        },
        scheduled: {
          class: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-500/20",
          text: "Scheduled"
        },
        published: {
          class: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20",
          text: "Published"
        },
        archived: {
          class: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 ring-1 ring-inset ring-purple-600/20 dark:ring-purple-500/20",
          text: "Archived"
        },
        deleted: {
          class: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20",
          text: "Deleted"
        }
      };
      const config = statusConfig[row.status] || statusConfig.draft;
      const statusBadge = `
        <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${config?.class || ""}">
          ${config?.text || row.status}
        </span>
      `;
      const authorName = row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : row.author_email || "Unknown";
      const formattedDate = new Date(row.updated_at).toLocaleDateString();
      const availableActions = [];
      switch (row.status) {
        case "draft":
          availableActions.push("submit_for_review", "publish");
          break;
        case "review":
          availableActions.push("approve", "request_changes");
          break;
        case "published":
          availableActions.push("unpublish", "archive");
          break;
        case "scheduled":
          availableActions.push("unschedule");
          break;
      }
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        modelName: row.collection_display_name,
        statusBadge,
        authorName,
        formattedDate,
        availableActions
      };
    });
    const pageData = {
      modelName,
      status,
      page,
      search,
      models,
      contentItems,
      totalItems,
      itemsPerPage: limit,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : void 0,
      version: c.get("appVersion")
    };
    return c.html(renderContentListPage(pageData));
  } catch (error) {
    console.error("Error fetching content list:", error);
    return c.html(`<p>Error loading content: ${error}</p>`);
  }
});
adminContentRoutes.get("/new", async (c) => {
  try {
    const user = c.get("user");
    const url = new URL(c.req.url);
    const collectionId = url.searchParams.get("collection");
    if (!collectionId) {
      const db2 = c.env.DB;
      const collectionsStmt = db2.prepare("SELECT id, name, display_name, description FROM collections WHERE is_active = 1 ORDER BY display_name");
      const { results } = await collectionsStmt.all();
      const collections = (results || []).map((row) => ({
        id: row.id,
        name: row.name,
        display_name: row.display_name,
        description: row.description
      }));
      const selectionHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Select Collection - SonicJS AI Admin</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 text-white">
          <div class="min-h-screen flex items-center justify-center">
            <div class="max-w-2xl w-full mx-auto p-8">
              <h1 class="text-3xl font-bold mb-8 text-center">Create New Content</h1>
              <p class="text-gray-300 text-center mb-8">Select a collection to create content in:</p>
              
              <div class="grid gap-4">
                ${collections.map((collection2) => `
                  <a href="/admin/content/new?collection=${collection2.id}" 
                     class="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
                    <h3 class="text-xl font-semibold mb-2">${collection2.display_name}</h3>
                    <p class="text-gray-400">${collection2.description || "No description"}</p>
                  </a>
                `).join("")}
              </div>
              
              <div class="mt-8 text-center">
                <a href="/admin/content" class="text-blue-400 hover:text-blue-300">\u2190 Back to Content List</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      return c.html(selectionHTML);
    }
    const db = c.env.DB;
    const collection = await getCollection(db, collectionId);
    if (!collection) {
      const formData2 = {
        collection: { id: "", name: "", display_name: "Unknown", schema: {} },
        fields: [],
        error: "Collection not found.",
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : void 0
      };
      return c.html(renderContentFormPage(formData2));
    }
    const fields = await getCollectionFields(db, collectionId);
    const workflowEnabled = await chunk24PWAFUT_cjs.isPluginActive(db, "workflow");
    const formData = {
      collection,
      fields,
      isEdit: false,
      workflowEnabled,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : void 0
    };
    return c.html(renderContentFormPage(formData));
  } catch (error) {
    console.error("Error loading new content form:", error);
    const formData = {
      collection: { id: "", name: "", display_name: "Unknown", schema: {} },
      fields: [],
      error: "Failed to load content form.",
      user: c.get("user") ? {
        name: c.get("user").email,
        email: c.get("user").email,
        role: c.get("user").role
      } : void 0
    };
    return c.html(renderContentFormPage(formData));
  }
});
adminContentRoutes.get("/:id/edit", async (c) => {
  try {
    const id = c.req.param("id");
    const user = c.get("user");
    const db = c.env.DB;
    const url = new URL(c.req.url);
    const referrerParams = url.searchParams.get("ref") || "";
    const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.content);
    const content = await cache.getOrSet(
      cache.generateKey("content", id),
      async () => {
        const contentStmt = db.prepare(`
          SELECT c.*, col.id as collection_id, col.name as collection_name,
                 col.display_name as collection_display_name, col.description as collection_description,
                 col.schema as collection_schema
          FROM content c
          JOIN collections col ON c.collection_id = col.id
          WHERE c.id = ?
        `);
        return await contentStmt.bind(id).first();
      }
    );
    if (!content) {
      const formData2 = {
        collection: { id: "", name: "", display_name: "Unknown", schema: {} },
        fields: [],
        error: "Content not found.",
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : void 0
      };
      return c.html(renderContentFormPage(formData2));
    }
    const collection = {
      id: content.collection_id,
      name: content.collection_name,
      display_name: content.collection_display_name,
      description: content.collection_description,
      schema: content.collection_schema ? JSON.parse(content.collection_schema) : {}
    };
    const fields = await getCollectionFields(db, content.collection_id);
    const contentData = content.data ? JSON.parse(content.data) : {};
    const workflowEnabled = await chunk24PWAFUT_cjs.isPluginActive(db, "workflow");
    const formData = {
      id: content.id,
      title: content.title,
      slug: content.slug,
      data: contentData,
      status: content.status,
      scheduled_publish_at: content.scheduled_publish_at,
      scheduled_unpublish_at: content.scheduled_unpublish_at,
      review_status: content.review_status,
      meta_title: content.meta_title,
      meta_description: content.meta_description,
      collection,
      fields,
      isEdit: true,
      workflowEnabled,
      referrerParams,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : void 0,
      version: c.get("appVersion")
    };
    return c.html(renderContentFormPage(formData));
  } catch (error) {
    console.error("Error loading edit content form:", error);
    const formData = {
      collection: { id: "", name: "", display_name: "Unknown", schema: {} },
      fields: [],
      error: "Failed to load content for editing.",
      user: c.get("user") ? {
        name: c.get("user").email,
        email: c.get("user").email,
        role: c.get("user").role
      } : void 0
    };
    return c.html(renderContentFormPage(formData));
  }
});
adminContentRoutes.post("/", async (c) => {
  try {
    const user = c.get("user");
    const formData = await c.req.formData();
    const collectionId = formData.get("collection_id");
    const action = formData.get("action");
    if (!collectionId) {
      return c.html(html.html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Collection ID is required.
        </div>
      `);
    }
    const db = c.env.DB;
    const collection = await getCollection(db, collectionId);
    if (!collection) {
      return c.html(html.html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Collection not found.
        </div>
      `);
    }
    const fields = await getCollectionFields(db, collectionId);
    const data = {};
    const errors = {};
    for (const field of fields) {
      const value = formData.get(field.field_name);
      if (field.field_type === "guid") {
        const options = field.field_options || {};
        if (options.autoGenerate) {
          data[field.field_name] = crypto.randomUUID();
          continue;
        }
      }
      if (field.is_required && (!value || value.toString().trim() === "")) {
        errors[field.field_name] = [`${field.field_label} is required`];
        continue;
      }
      switch (field.field_type) {
        case "number":
          if (value && isNaN(Number(value))) {
            errors[field.field_name] = [`${field.field_label} must be a valid number`];
          } else {
            data[field.field_name] = value ? Number(value) : null;
          }
          break;
        case "boolean":
          data[field.field_name] = formData.get(`${field.field_name}_submitted`) ? value === "true" : false;
          break;
        case "select":
          if (field.field_options?.multiple) {
            data[field.field_name] = formData.getAll(`${field.field_name}[]`);
          } else {
            data[field.field_name] = value;
          }
          break;
        case "guid":
          data[field.field_name] = value || null;
          break;
        default:
          data[field.field_name] = value;
      }
    }
    if (Object.keys(errors).length > 0) {
      const formDataWithErrors = {
        collection,
        fields,
        data,
        validationErrors: errors,
        error: "Please fix the validation errors below.",
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : void 0
      };
      return c.html(renderContentFormPage(formDataWithErrors));
    }
    let slug = data.slug || data.title;
    if (slug) {
      slug = slug.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim("-");
    }
    let status = formData.get("status") || "draft";
    if (action === "save_and_publish") {
      status = "published";
    }
    const scheduledPublishAt = formData.get("scheduled_publish_at");
    const scheduledUnpublishAt = formData.get("scheduled_unpublish_at");
    const contentId = crypto.randomUUID();
    const now = Date.now();
    const insertStmt = db.prepare(`
      INSERT INTO content (
        id, collection_id, slug, title, data, status, 
        scheduled_publish_at, scheduled_unpublish_at,
        meta_title, meta_description, author_id, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await insertStmt.bind(
      contentId,
      collectionId,
      slug,
      data.title || "Untitled",
      JSON.stringify(data),
      status,
      scheduledPublishAt ? new Date(scheduledPublishAt).getTime() : null,
      scheduledUnpublishAt ? new Date(scheduledUnpublishAt).getTime() : null,
      data.meta_title || null,
      data.meta_description || null,
      user?.userId || "unknown",
      now,
      now
    ).run();
    const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.content);
    await cache.invalidate(`content:list:${collectionId}:*`);
    const versionStmt = db.prepare(`
      INSERT INTO content_versions (id, content_id, version, data, author_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    await versionStmt.bind(
      crypto.randomUUID(),
      contentId,
      1,
      JSON.stringify(data),
      user?.userId || "unknown",
      now
    ).run();
    const workflowStmt = db.prepare(`
      INSERT INTO workflow_history (id, content_id, action, from_status, to_status, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    await workflowStmt.bind(
      crypto.randomUUID(),
      contentId,
      "created",
      "none",
      status,
      user?.userId || "unknown",
      now
    ).run();
    const referrerParams = formData.get("referrer_params");
    const redirectUrl = action === "save_and_continue" ? `/admin/content/${contentId}/edit?success=Content saved successfully!${referrerParams ? `&ref=${encodeURIComponent(referrerParams)}` : ""}` : referrerParams ? `/admin/content?${referrerParams}&success=Content created successfully!` : `/admin/content?collection=${collectionId}&success=Content created successfully!`;
    const isHTMX = c.req.header("HX-Request") === "true";
    if (isHTMX) {
      return c.text("", 200, {
        "HX-Redirect": redirectUrl
      });
    } else {
      return c.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("Error creating content:", error);
    return c.html(html.html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to create content. Please try again.
      </div>
    `);
  }
});
adminContentRoutes.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const user = c.get("user");
    const formData = await c.req.formData();
    const action = formData.get("action");
    const db = c.env.DB;
    const contentStmt = db.prepare("SELECT * FROM content WHERE id = ?");
    const existingContent = await contentStmt.bind(id).first();
    if (!existingContent) {
      return c.html(html.html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Content not found.
        </div>
      `);
    }
    const collection = await getCollection(db, existingContent.collection_id);
    if (!collection) {
      return c.html(html.html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Collection not found.
        </div>
      `);
    }
    const fields = await getCollectionFields(db, existingContent.collection_id);
    const data = {};
    const errors = {};
    for (const field of fields) {
      const value = formData.get(field.field_name);
      if (field.is_required && (!value || value.toString().trim() === "")) {
        errors[field.field_name] = [`${field.field_label} is required`];
        continue;
      }
      switch (field.field_type) {
        case "number":
          if (value && isNaN(Number(value))) {
            errors[field.field_name] = [`${field.field_label} must be a valid number`];
          } else {
            data[field.field_name] = value ? Number(value) : null;
          }
          break;
        case "boolean":
          data[field.field_name] = formData.get(`${field.field_name}_submitted`) ? value === "true" : false;
          break;
        case "select":
          if (field.field_options?.multiple) {
            data[field.field_name] = formData.getAll(`${field.field_name}[]`);
          } else {
            data[field.field_name] = value;
          }
          break;
        default:
          data[field.field_name] = value;
      }
    }
    if (Object.keys(errors).length > 0) {
      const formDataWithErrors = {
        id,
        collection,
        fields,
        data,
        validationErrors: errors,
        error: "Please fix the validation errors below.",
        isEdit: true,
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : void 0
      };
      return c.html(renderContentFormPage(formDataWithErrors));
    }
    let slug = data.slug || data.title;
    if (slug) {
      slug = slug.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim("-");
    }
    let status = formData.get("status") || existingContent.status;
    if (action === "save_and_publish") {
      status = "published";
    }
    const scheduledPublishAt = formData.get("scheduled_publish_at");
    const scheduledUnpublishAt = formData.get("scheduled_unpublish_at");
    const now = Date.now();
    const updateStmt = db.prepare(`
      UPDATE content SET
        slug = ?, title = ?, data = ?, status = ?,
        scheduled_publish_at = ?, scheduled_unpublish_at = ?,
        meta_title = ?, meta_description = ?, updated_at = ?
      WHERE id = ?
    `);
    await updateStmt.bind(
      slug,
      data.title || "Untitled",
      JSON.stringify(data),
      status,
      scheduledPublishAt ? new Date(scheduledPublishAt).getTime() : null,
      scheduledUnpublishAt ? new Date(scheduledUnpublishAt).getTime() : null,
      data.meta_title || null,
      data.meta_description || null,
      now,
      id
    ).run();
    const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.content);
    await cache.delete(cache.generateKey("content", id));
    await cache.invalidate(`content:list:${existingContent.collection_id}:*`);
    const existingData = JSON.parse(existingContent.data || "{}");
    if (JSON.stringify(existingData) !== JSON.stringify(data)) {
      const versionCountStmt = db.prepare("SELECT MAX(version) as max_version FROM content_versions WHERE content_id = ?");
      const versionResult = await versionCountStmt.bind(id).first();
      const nextVersion = (versionResult?.max_version || 0) + 1;
      const versionStmt = db.prepare(`
        INSERT INTO content_versions (id, content_id, version, data, author_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      await versionStmt.bind(
        crypto.randomUUID(),
        id,
        nextVersion,
        JSON.stringify(data),
        user?.userId || "unknown",
        now
      ).run();
    }
    if (status !== existingContent.status) {
      const workflowStmt = db.prepare(`
        INSERT INTO workflow_history (id, content_id, action, from_status, to_status, user_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      await workflowStmt.bind(
        crypto.randomUUID(),
        id,
        "status_changed",
        existingContent.status,
        status,
        user?.userId || "unknown",
        now
      ).run();
    }
    const referrerParams = formData.get("referrer_params");
    const redirectUrl = action === "save_and_continue" ? `/admin/content/${id}/edit?success=Content updated successfully!${referrerParams ? `&ref=${encodeURIComponent(referrerParams)}` : ""}` : referrerParams ? `/admin/content?${referrerParams}&success=Content updated successfully!` : `/admin/content?collection=${existingContent.collection_id}&success=Content updated successfully!`;
    const isHTMX = c.req.header("HX-Request") === "true";
    if (isHTMX) {
      return c.text("", 200, {
        "HX-Redirect": redirectUrl
      });
    } else {
      return c.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("Error updating content:", error);
    return c.html(html.html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to update content. Please try again.
      </div>
    `);
  }
});
adminContentRoutes.post("/preview", async (c) => {
  try {
    const formData = await c.req.formData();
    const collectionId = formData.get("collection_id");
    const db = c.env.DB;
    const collection = await getCollection(db, collectionId);
    if (!collection) {
      return c.html("<p>Collection not found</p>");
    }
    const fields = await getCollectionFields(db, collectionId);
    const data = {};
    for (const field of fields) {
      const value = formData.get(field.field_name);
      switch (field.field_type) {
        case "number":
          data[field.field_name] = value ? Number(value) : null;
          break;
        case "boolean":
          data[field.field_name] = value === "true";
          break;
        case "select":
          if (field.field_options?.multiple) {
            data[field.field_name] = formData.getAll(`${field.field_name}[]`);
          } else {
            data[field.field_name] = value;
          }
          break;
        default:
          data[field.field_name] = value;
      }
    }
    const previewHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview: ${data.title || "Untitled"}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
          .content { line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>${data.title || "Untitled"}</h1>
        <div class="meta">
          <strong>Collection:</strong> ${collection.display_name}<br>
          <strong>Status:</strong> ${formData.get("status") || "draft"}<br>
          ${data.meta_description ? `<strong>Description:</strong> ${data.meta_description}<br>` : ""}
        </div>
        <div class="content">
          ${data.content || "<p>No content provided.</p>"}
        </div>
        
        <h3>All Fields:</h3>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <tr><th>Field</th><th>Value</th></tr>
          ${fields.map((field) => `
            <tr>
              <td><strong>${field.field_label}</strong></td>
              <td>${data[field.field_name] || "<em>empty</em>"}</td>
            </tr>
          `).join("")}
        </table>
      </body>
      </html>
    `;
    return c.html(previewHTML);
  } catch (error) {
    console.error("Error generating preview:", error);
    return c.html("<p>Error generating preview</p>");
  }
});
adminContentRoutes.post("/duplicate", async (c) => {
  try {
    const user = c.get("user");
    const formData = await c.req.formData();
    const originalId = formData.get("id");
    if (!originalId) {
      return c.json({ success: false, error: "Content ID required" });
    }
    const db = c.env.DB;
    const contentStmt = db.prepare("SELECT * FROM content WHERE id = ?");
    const original = await contentStmt.bind(originalId).first();
    if (!original) {
      return c.json({ success: false, error: "Content not found" });
    }
    const newId = crypto.randomUUID();
    const now = Date.now();
    const originalData = JSON.parse(original.data || "{}");
    originalData.title = `${originalData.title || "Untitled"} (Copy)`;
    const insertStmt = db.prepare(`
      INSERT INTO content (
        id, collection_id, slug, title, data, status, 
        author_id, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await insertStmt.bind(
      newId,
      original.collection_id,
      `${original.slug}-copy-${Date.now()}`,
      originalData.title,
      JSON.stringify(originalData),
      "draft",
      // Always start as draft
      user?.userId || "unknown",
      now,
      now
    ).run();
    return c.json({ success: true, id: newId });
  } catch (error) {
    console.error("Error duplicating content:", error);
    return c.json({ success: false, error: "Failed to duplicate content" });
  }
});
adminContentRoutes.get("/bulk-actions", async (c) => {
  const bulkActionsModal = `
    <div class="fixed inset-0 bg-zinc-950/50 dark:bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick="this.remove()">
      <div class="bg-white dark:bg-zinc-900 rounded-xl shadow-xl ring-1 ring-zinc-950/5 dark:ring-white/10 p-6 max-w-md w-full" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-zinc-950 dark:text-white">Bulk Actions</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Select items from the table below to perform bulk actions.
        </p>
        <div class="space-y-2">
          <button
            onclick="performBulkAction('publish')"
            class="w-full inline-flex items-center justify-center gap-x-2 px-4 py-2.5 bg-lime-600 dark:bg-lime-500 text-white rounded-lg hover:bg-lime-700 dark:hover:bg-lime-600 transition-colors"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Publish Selected
          </button>
          <button
            onclick="performBulkAction('draft')"
            class="w-full inline-flex items-center justify-center gap-x-2 px-4 py-2.5 bg-zinc-600 dark:bg-zinc-700 text-white rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
            Move to Draft
          </button>
          <button
            onclick="performBulkAction('delete')"
            class="w-full inline-flex items-center justify-center gap-x-2 px-4 py-2.5 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Delete Selected
          </button>
        </div>
      </div>
    </div>
    <script>
      function performBulkAction(action) {
        const selectedIds = Array.from(document.querySelectorAll('input[type="checkbox"].row-checkbox:checked'))
          .map(cb => cb.value)
          .filter(id => id)

        if (selectedIds.length === 0) {
          alert('Please select at least one item')
          return
        }

        const actionText = action === 'publish' ? 'publish' : action === 'draft' ? 'move to draft' : 'delete'
        const confirmed = confirm(\`Are you sure you want to \${actionText} \${selectedIds.length} item(s)?\`)

        if (!confirmed) return

        fetch('/admin/content/bulk-action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: action,
            ids: selectedIds
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            document.querySelector('#bulk-actions-modal .fixed').remove()
            location.reload()
          } else {
            alert('Error: ' + (data.error || 'Unknown error'))
          }
        })
        .catch(err => {
          console.error('Bulk action error:', err)
          alert('Failed to perform bulk action')
        })
      }
    </script>
  `;
  return c.html(bulkActionsModal);
});
adminContentRoutes.post("/bulk-action", async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const { action, ids } = body;
    if (!action || !ids || ids.length === 0) {
      return c.json({ success: false, error: "Action and IDs required" });
    }
    const db = c.env.DB;
    const now = Date.now();
    if (action === "delete") {
      const placeholders = ids.map(() => "?").join(",");
      const stmt = db.prepare(`
        UPDATE content
        SET status = 'deleted', updated_at = ?
        WHERE id IN (${placeholders})
      `);
      await stmt.bind(now, ...ids).run();
    } else if (action === "publish" || action === "draft") {
      const placeholders = ids.map(() => "?").join(",");
      const publishedAt = action === "publish" ? now : null;
      const stmt = db.prepare(`
        UPDATE content
        SET status = ?, published_at = ?, updated_at = ?
        WHERE id IN (${placeholders})
      `);
      await stmt.bind(action, publishedAt, now, ...ids).run();
    } else {
      return c.json({ success: false, error: "Invalid action" });
    }
    const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.content);
    for (const contentId of ids) {
      await cache.delete(cache.generateKey("content", contentId));
    }
    await cache.invalidate("content:list:*");
    return c.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("Bulk action error:", error);
    return c.json({ success: false, error: "Failed to perform bulk action" });
  }
});
adminContentRoutes.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const user = c.get("user");
    const contentStmt = db.prepare("SELECT id, title FROM content WHERE id = ?");
    const content = await contentStmt.bind(id).first();
    if (!content) {
      return c.json({ success: false, error: "Content not found" }, 404);
    }
    const now = Date.now();
    const deleteStmt = db.prepare(`
      UPDATE content
      SET status = 'deleted', updated_at = ?
      WHERE id = ?
    `);
    await deleteStmt.bind(now, id).run();
    const cache = chunkAGOE25LF_cjs.getCacheService(chunkAGOE25LF_cjs.CACHE_CONFIGS.content);
    await cache.delete(cache.generateKey("content", id));
    await cache.invalidate("content:list:*");
    return c.html(`
      <div id="content-list" hx-get="/admin/content?model=${c.req.query("model") || "post"}" hx-trigger="load" hx-swap="outerHTML">
        <div class="flex items-center justify-center p-8">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-lime-500 dark:text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Content deleted successfully. Refreshing...</p>
          </div>
        </div>
      </div>
    `);
  } catch (error) {
    console.error("Delete content error:", error);
    return c.json({ success: false, error: "Failed to delete content" }, 500);
  }
});
adminContentRoutes.get("/:id/versions", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;
    const contentStmt = db.prepare("SELECT * FROM content WHERE id = ?");
    const content = await contentStmt.bind(id).first();
    if (!content) {
      return c.html("<p>Content not found</p>");
    }
    const versionsStmt = db.prepare(`
      SELECT cv.*, u.first_name, u.last_name, u.email
      FROM content_versions cv
      LEFT JOIN users u ON cv.author_id = u.id
      WHERE cv.content_id = ?
      ORDER BY cv.version DESC
    `);
    const { results } = await versionsStmt.bind(id).all();
    const versions = (results || []).map((row) => ({
      id: row.id,
      version: row.version,
      data: JSON.parse(row.data || "{}"),
      author_id: row.author_id,
      author_name: row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : row.email,
      created_at: row.created_at,
      is_current: false
      // Will be set below
    }));
    if (versions.length > 0) {
      versions[0].is_current = true;
    }
    const data = {
      contentId: id,
      versions,
      currentVersion: versions.length > 0 ? versions[0].version : 1
    };
    return c.html(renderVersionHistory(data));
  } catch (error) {
    console.error("Error loading version history:", error);
    return c.html("<p>Error loading version history</p>");
  }
});
adminContentRoutes.post("/:id/restore/:version", async (c) => {
  try {
    const id = c.req.param("id");
    const version = parseInt(c.req.param("version"));
    const user = c.get("user");
    const db = c.env.DB;
    const versionStmt = db.prepare(`
      SELECT * FROM content_versions 
      WHERE content_id = ? AND version = ?
    `);
    const versionData = await versionStmt.bind(id, version).first();
    if (!versionData) {
      return c.json({ success: false, error: "Version not found" });
    }
    const contentStmt = db.prepare("SELECT * FROM content WHERE id = ?");
    const currentContent = await contentStmt.bind(id).first();
    if (!currentContent) {
      return c.json({ success: false, error: "Content not found" });
    }
    const restoredData = JSON.parse(versionData.data);
    const now = Date.now();
    const updateStmt = db.prepare(`
      UPDATE content SET
        title = ?, data = ?, updated_at = ?
      WHERE id = ?
    `);
    await updateStmt.bind(
      restoredData.title || "Untitled",
      versionData.data,
      now,
      id
    ).run();
    const nextVersionStmt = db.prepare("SELECT MAX(version) as max_version FROM content_versions WHERE content_id = ?");
    const nextVersionResult = await nextVersionStmt.bind(id).first();
    const nextVersion = (nextVersionResult?.max_version || 0) + 1;
    const newVersionStmt = db.prepare(`
      INSERT INTO content_versions (id, content_id, version, data, author_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    await newVersionStmt.bind(
      crypto.randomUUID(),
      id,
      nextVersion,
      versionData.data,
      user?.userId || "unknown",
      now
    ).run();
    const workflowStmt = db.prepare(`
      INSERT INTO workflow_history (id, content_id, action, from_status, to_status, user_id, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await workflowStmt.bind(
      crypto.randomUUID(),
      id,
      "version_restored",
      currentContent.status,
      currentContent.status,
      user?.userId || "unknown",
      `Restored to version ${version}`,
      now
    ).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Error restoring version:", error);
    return c.json({ success: false, error: "Failed to restore version" });
  }
});
adminContentRoutes.get("/:id/version/:version/preview", async (c) => {
  try {
    const id = c.req.param("id");
    const version = parseInt(c.req.param("version"));
    const db = c.env.DB;
    const versionStmt = db.prepare(`
      SELECT cv.*, c.collection_id, col.display_name as collection_name
      FROM content_versions cv
      JOIN content c ON cv.content_id = c.id
      JOIN collections col ON c.collection_id = col.id
      WHERE cv.content_id = ? AND cv.version = ?
    `);
    const versionData = await versionStmt.bind(id, version).first();
    if (!versionData) {
      return c.html("<p>Version not found</p>");
    }
    const data = JSON.parse(versionData.data || "{}");
    const previewHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Version ${version} Preview: ${data.title || "Untitled"}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .meta { color: #666; font-size: 14px; margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
          .content { line-height: 1.6; }
          .version-badge { background: #007cba; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="meta">
          <span class="version-badge">Version ${version}</span>
          <strong>Collection:</strong> ${versionData.collection_name}<br>
          <strong>Created:</strong> ${new Date(versionData.created_at).toLocaleString()}<br>
          <em>This is a historical version preview</em>
        </div>
        
        <h1>${data.title || "Untitled"}</h1>
        
        <div class="content">
          ${data.content || "<p>No content provided.</p>"}
        </div>
        
        ${data.excerpt ? `<h3>Excerpt:</h3><p>${data.excerpt}</p>` : ""}
        
        <h3>All Field Data:</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
${JSON.stringify(data, null, 2)}
        </pre>
      </body>
      </html>
    `;
    return c.html(previewHTML);
  } catch (error) {
    console.error("Error generating version preview:", error);
    return c.html("<p>Error generating preview</p>");
  }
});
var admin_content_default = adminContentRoutes;

// src/routes/index.ts
var ROUTES_INFO = {
  message: "Routes migration in progress",
  available: [
    "apiRoutes",
    "apiContentCrudRoutes",
    "apiMediaRoutes",
    "apiSystemRoutes",
    "adminApiRoutes",
    "authRoutes",
    "adminContentRoutes"
  ],
  status: "Routes are being added incrementally",
  reference: "https://github.com/sonicjs/sonicjs"
};

exports.ROUTES_INFO = ROUTES_INFO;
exports.admin_api_default = admin_api_default;
exports.admin_content_default = admin_content_default;
exports.api_content_crud_default = api_content_crud_default;
exports.api_default = api_default;
exports.api_media_default = api_media_default;
exports.api_system_default = api_system_default;
exports.auth_default = auth_default;
//# sourceMappingURL=chunk-B5DU2UAN.cjs.map
//# sourceMappingURL=chunk-B5DU2UAN.cjs.map