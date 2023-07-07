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
  limit?: number,
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

export async function deleteById(db, key) {
  console.log("deleting kv " + key);
  return db.delete(key);
}

export function getAsset(db, key) {
  return db.get(key, { type: "text" });
}

export function putData(db, site, contentType, value, key = undefined) {
  const generatedKey = getKey(site, contentType, key);
  console.log("generatedKey", generatedKey);
  return db.put(generatedKey, JSON.stringify(value));
}

export function putDataWithMetaData(
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
  console.log("generatedKey", generatedKey);
  return db.put(generatedKey, JSON.stringify(contentTypeComponents));
}

export function saveContent(db, content, timestamp, id) {
  console.log("saveContent--->", JSON.stringify(content, null, 2));
  // delete content.metadata;
  delete content.contentType;
  delete content.submit;

  // const contentType = content.data.systemId;
  // const generatedKey = getKey(timestamp, content.data.table, id);
  const metadata = {
    id,
    table: content.table,
    created_on: timestamp,
    updated_on: timestamp,
  };

  console.log("metadata ==>", metadata);

  // const size = JSON.stringify(content).length;

  // console.log("size", size);

  return db.put(id, JSON.stringify(content), {
    metadata,
  });
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

export function add(a, b) {
  return a + b;
}
