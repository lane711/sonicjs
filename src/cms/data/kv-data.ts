import { log } from "../util/logger";

export function getKey(timestamp, table, id): string {
  return `${timestamp}::${table}::${id}`;
}

// export function getContentKey(site, schema, key = undefined): string {
//   return (
//     key ?? `${site}::content::${schema}::${getTicksSortKey()}::${getId(7)}`
//   );
// }

export function getDataListByPrefix(
  db,
  prefix = "",
  limit: number = 100,
  cursor?: string
) {
  return db.list({ prefix, limit, cursor });
}

export async function getDataByPrefix(
  db,
  prefix = "",
  limit?: number,
  cursor?: string
) {
  const list = await getDataListByPrefix(db, prefix, limit, cursor);
  const content = [];

  for await (const key of list.keys) {
    const record = await getById(db, key.name);
    const data = record.data;
    const dataWithKey = { key: key.name, ...data }; //add key to top of object
    content.push(dataWithKey);
  }

  return content;
}

export async function getById(db, key) {
  return db.get(key, { type: "json" });
}

export async function deleteKVById(db, key) {
  // console.log("deleting kv " + key);
  return db.delete(key);
}

export function getAsset(db, key) {
  return db.get(key, { type: "text" });
}

export function saveKVData(db, id, data) {
  // const generatedKey = getKey(timestamp, value., id);
  // console.log("generatedKey", generatedKey);
  return db.put(id, JSON.stringify(data));
}

export function saveKVDataWithMetaData(
  db,
  site,
  contentType,
  value,
  key = undefined
) {
  const generatedKey = getKey(site, contentType, key);
  console.log("generatedKey", generatedKey);
  return db.put(generatedKey, JSON.stringify(value), {
    metadata: { value },
  });
}

export function saveContentType(db, site, contentTypeComponents) {
  const contentType = extractContentType(contentTypeComponents);
  const generatedKey = `${site}::content-type::${contentType}`;
  // console.log("generatedKey", generatedKey);
  return db.put(generatedKey, JSON.stringify(contentTypeComponents));
}

export async function addToKvCache(ctx, kv, key, value) {
  const cacheKey = addCachePrefix(key);

  const createdOn = new Date().getTime();

  log(ctx, {
    level: "verbose",
    message: `addToKvCache before put`,
    key,
    cacheKey,
    createdOn,
    value,
  });

  await kv.put(cacheKey, JSON.stringify(value), {
    metadata: { createdOn },
  });

  log(ctx, {
    level: "verbose",
    message: `addToKvCache after put`,
    cacheKey,
  });
}

export async function getRecordFromKvCache(db, key, ignorePrefix = false) {
  const lookupKey = ignorePrefix ? key : addCachePrefix(key);
  var isJSon = false;
  var results;
  try {
    results = await db.get(lookupKey, { type: "json" });
    isJSon = true;
  } catch (error) {
    results = await db.get(lookupKey);
  }

  return results;
}

export function getKVCache(db) {
  return getDataListByPrefix(db, addCachePrefix(""));
}

export function getAllKV(db) {
  return getDataListByPrefix(db, "");
}

export async function clearKVCache(db) {
  const itemsToDelete = await getDataListByPrefix(db, addCachePrefix(""));
  for await (const key of itemsToDelete.keys) {
    await deleteKVById(db, key.name);
  }
}

export async function clearAllKVRecords(db) {
  const itemsToDelete = await getDataListByPrefix(db);
  for await (const key of itemsToDelete.keys) {
    await deleteKVById(db, key.name);
  }
}

export function addCachePrefix(key: string = "") {
  return `cache::${key}`;
}

export function saveContent(db, content, timestamp, id) {
  // console.log("inserting KV data", JSON.stringify(content, null, 2));
  // delete content.metadata;
  delete content.contentType;
  // delete content.submit;

  // const contentType = content.data.systemId;
  // const generatedKey = getKey(timestamp, content.data.table, id);
  const metadata = {
    id,
    table: content.table,
    createdOn: timestamp,
    updatedOn: timestamp,
  };

  // console.log("metadata ==>", metadata);

  // const size = JSON.stringify(content).length;

  // console.log("size", size);
}

export function extractContentType(contentTypeComponents) {
  const contentType = contentTypeComponents.find((c) => c.key === "systemId");
  return contentType.defaultValue;
}

export async function getContentType(db, contentTypeSystemId) {
  const contentType = await db.get(
    `site1::content-type::${contentTypeSystemId}`,
    { type: "json" }
  );
  return contentType;
}

export async function getContentTypes(db) {
  const contentTypeKeys = await db.list({ prefix: "site1::content-type::" });
  console.log("contentTypeKeys", contentTypeKeys);
  var contentTypes = [];
  for await (const key of contentTypeKeys.keys) {
    const record = await getById(db, key.name);
    const contentType = { key: key.name, components: record };
    contentTypes.push(contentType);
  }
  return contentTypes;
}

//keys

export function addKeyPrefix(key: string = "") {
  return `key::${key}`;
}

export async function addToKvKeys(ctx, kv, url) {
  const cacheKey = addKeyPrefix(url);

  const lastAccessed = new Date().getTime();

  log(ctx, {
    level: "verbose",
    message: `addToKvKeys before put`,
    url,
    cacheKey,
    lastAccessed
  });

  await kv.put(cacheKey, '', {
    metadata: { lastAccessed, url },
  });

  log(ctx, {
    level: "verbose",
    message: `addToKvKeys after put`,
    cacheKey,
  });
}


export async function getKVKeys(
  db,
  limit: number = 100,
  cursor?: string
) {
  const prefix = addKeyPrefix();
  return db.list({ prefix, limit, cursor });
}

export async function getKVKeysSorted(
  db,
  limit: number = 100,
  cursor?: string
) {
  const results = await getKVKeys(db, limit, cursor)
  return results.keys.sort(compareByLastAccessed).reverse();
}

function compareByLastAccessed(a, b) {
  return a.metadata.lastAccessed - a.metadata.lastAccessed;
}
