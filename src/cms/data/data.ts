import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { v4 as uuidv4 } from "uuid";
import {
  postsTable,
  postSchema,
  userSchema,
  usersTable,
  categorySchema,
  commentSchema,
  categoriesTable,
  commentsTable,
} from "../../db/schema";
import { DefaultLogger, LogWriter, eq } from "drizzle-orm";
import {
  addToInMemoryCache,
  getFromInMemoryCache,
  isCacheValid,
  setCacheStatusInvalid,
} from "./cache";
import {
  addCachePrefix,
  addToKvCache,
  clearKVCache,
  deleteKVById,
  getRecordFromKvCache,
  saveKVData,
} from "./kv-data";
import {
  deleteD1ByTableAndId,
  getD1ByTableAndId,
  getD1DataByTable,
  insertD1Data,
  updateD1Data,
} from "./d1-data";

// export async function getRecordOld(d1, kv, id) {
//   const cacheKey = addCachePrefix(id);
//   const cacheResult = await getFromInMemoryCache(cacheKey);
//   console.log("cacheResult", cacheResult);
//   if (cacheResult && cacheResult.length) {
//     const cachedData = cacheResult[0].data;
//     console.log("**** cachedData ****", cachedData);

//     return cachedData;
//   }
//   const kvData = await getRecordFromKvCache(kv, id);

//   addToInMemoryCache(cacheKey, { data: kvData.data, source: "kv" });

//   return kvData;
// }

export async function getRecord(
  d1,
  kv,
  table,
  params,
  cacheKey,
  source = "fastest"
) {
  const cacheStatusValid = await isCacheValid();

  if (cacheStatusValid) {
    const cacheResult = await getFromInMemoryCache(cacheKey);
    console.log("cacheResult", cacheResult);
    if (cacheResult && cacheResult.length && source == "fastest") {
      const cachedData = cacheResult[0].data;
      console.log("**** cachedData ****", cachedData);

      return cachedData;
    }
  }

  const kvData = await getRecordFromKvCache(kv, cacheKey);
  if (source == "kv" || kvData) {
    console.log("**** getting kv cache ****", kvData);
    return kvData;
  }

  const d1Data = await getD1ByTableAndId(d1, table, params.id);

  addToInMemoryCache(cacheKey, { data: d1Data.data, source: "cache" });
  addToKvCache(kv, cacheKey, { data: d1Data.data, source: "kv" });

  // console.log("sql results ==>", results);

  return d1Data;
}

export async function getRecords(
  d1,
  kv,
  table,
  params,
  cacheKey,
  source = "fastest",
  customDataFunction = undefined
) {
  const cacheStatusValid = await isCacheValid();
  console.log("getRecords cacheStatusValid", cacheStatusValid);

  if (cacheStatusValid) {
    const cacheResult = await getFromInMemoryCache(cacheKey);
    console.log("cacheResult", cacheResult);
    if (cacheResult && cacheResult.length && source == "fastest") {
      const cachedData = cacheResult[0].data;
      console.log("**** cachedData ****", cachedData);

      return cachedData;
    }
  }

  if (source == "fastest" || source == "kv") {
    const kvData = await getRecordFromKvCache(kv, cacheKey);
    console.log("getRecords kvData", kvData);

    if (kvData) {
      return kvData;
    }
  }

  var d1Data;
  if (customDataFunction) {
    d1Data = await customDataFunction();
  } else {
    d1Data = await getD1DataByTable(d1, table, params);
    console.log("getRecords d1Data", d1Data);
  }

  addToInMemoryCache(cacheKey, { data: d1Data, source: "cache" });
  addToKvCache(kv, cacheKey, { data: d1Data, source: "kv" });

  return { data: d1Data, source: "d1" };
}

export async function insertRecord(d1, kv, data) {
  const content = data;
  const id = uuidv4();
  const timestamp = new Date().getTime();
  content.data.id = id;
  let error = "";

  console.log("insertRecord", content);

  try {
    const result = await saveKVData(kv, id, content.data);
    // console.log('result KV', result);
    // return ctx.json(id, 201);
  } catch (error) {
    error = "error posting content" + error;
  } finally {
    //then also save the content to sqlite for filtering, sorting, etc
    try {
      const result = await insertD1Data(d1, kv, content.table, content.data);
      console.log("insertD1Data --->", result);
      //expire cache
      await setCacheStatusInvalid();
      await clearKVCache(kv);

      return { code: 201, data: result };
    } catch (error) {
      error =
        "error posting content " +
        content.data.table +
        error +
        JSON.stringify(content.data, null, 2);
    }
  }
  return { code: 500, error };
}

export async function updateRecord(d1, kv, data) {
  const timestamp = new Date().getTime();

  try {
    const result = await saveKVData(kv, data, timestamp, data.id);
  } catch (error) {
    console.log("error posting content", error);
    return { code: 500, message: error };
  } finally {
    //then also save the content to sqlite for filtering, sorting, etc
    try {
      const result = updateD1Data(d1, data.table, data);
      //expire cache
      await setCacheStatusInvalid();
      await clearKVCache(kv);
      return { code: 200, data: result };
    } catch (error) {
      console.log("error posting content", error);
    }
  }
}

export async function deleteRecord(d1, kv, data) {
  const timestamp = new Date().getTime();

  try {
    const kvResult = await deleteKVById(kv, data.id);
    const d1Result = await deleteD1ByTableAndId(d1, data.table, data.id);

    await setCacheStatusInvalid();
    await clearKVCache(kv);
  } catch (error) {
    console.log("error deleting content", error);
    return { code: 500, message: error };
  }
}
