// declare const KVDATA: KVNamespace;

export function getKey(site, schema, key = undefined): string {
  return key ?? `${site}::${schema}::${getTicksSortKey()}::${getId(7)}`;
}

export function getContentKey(site, schema, key = undefined): string {
  return (
    key ?? `${site}::content::${schema}::${getTicksSortKey()}::${getId(7)}`
  );
}

function getTicksSortKey() {
  return new Date().getTime() * 10000;
}

export function getId(length) {
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  while (length--) res += charset[(Math.random() * charset.length) | 0];

  return res;
}

export function getDataListByPrefix(db, prefix = "") {
  return db.list({ prefix });
}

export async function getDataByPrefix(db, prefix = "") {
  const list = await getDataListByPrefix(db, prefix);
  // console.log("list", list);
  const content = [];

  for await (const key of list.keys) {
    const record = await getById(db, key.name);
    content.push(record.data);
  }

  // console.log("getDataByPrefix content--->", content);

  return content;
}

export async function getById(db, key) {
  return db.get(key, { type: "json" });
}

export function getAsset(db, key) {
  return db.get(key, { type: "text" });
}

export function putData(db, site, contentType, value, key = undefined) {
  const generatedKey = getKey(site, contentType, key);
  console.log("generatedKey", generatedKey);
  return db.put(generatedKey, JSON.stringify(value));
}

export function putDataWithMetaData(db, site, contentType, value, key = undefined) {
  const generatedKey = getKey(site, contentType, key);
  console.log("generatedKey", generatedKey);
  return db.put(generatedKey, JSON.stringify(value),{
    metadata: { value },
  });
}

export function saveContentType(db, site, contentTypeComponents) {
  const contentType = getContentType(contentTypeComponents);
  const generatedKey = `${site}::content-type::${contentType}`;
  console.log("generatedKey", generatedKey);
  return db.put(generatedKey, JSON.stringify(contentTypeComponents));
}

export function saveContent(db, site, content, key) {
  console.log("content--->", content.data.systemId);
  delete content.metadata;
  const contentType = content.data.systemId;
  const generatedKey = key ?? getContentKey(site, contentType);

  console.log("generatedKey", generatedKey);
  // return db.put(generatedKey, JSON.stringify(content));
  return db.put(generatedKey, JSON.stringify(content), {
    metadata: { content },
  });
}

export function getContentType(contentTypeComponents) {
  const contentType = contentTypeComponents.find((c) => c.key === "systemId");
  return contentType.defaultValue;
}

export async function getContentTypes(db) {
  const contentTypeKeys = await db.list({prefix:'site1::content-type::'});
  var contentTypes = [];
  for await (const key of contentTypeKeys.keys) {
    const record = await getById(db, key.name);
    const contentType = {key: key.name, components: record}
    contentTypes.push(contentType);
  }
  return contentTypes;
}

export function add(a, b) {
  return a + b;
}
