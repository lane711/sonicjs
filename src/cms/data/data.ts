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
import { addToInMemoryCache, getFromInMemoryCache } from "./cache";
import { addCachePrefix, addToKvCache, getRecordFromKvCache, saveKVData } from "./kv-data";
import { getD1DataByTable, insertD1Data } from "./d1-data";


export async function getRecord(d1, kv, id) {
  const cacheKey = addCachePrefix(id);
  const cacheResult = await getFromInMemoryCache(cacheKey);
  console.log("cacheResult", cacheResult);
  if (cacheResult && cacheResult.length) {
    const cachedData = cacheResult[0].data;
    console.log("**** cachedData ****", cachedData);

    return cachedData;
  }
  const kvData = await getRecordFromKvCache(kv, id) 


  addToInMemoryCache(cacheKey, { data: kvData.data, source: "kv" });

  // console.log("sql results ==>", results);

  return kvData;
}

export async function getRecords(d1, kv, table, params, cacheKey, source = 'fastest') {
  const cacheResult = await getFromInMemoryCache(cacheKey);
  console.log("cacheResult", cacheResult);
  if (cacheResult && cacheResult.length && source == 'fastest') {
    const cachedData = cacheResult[0].data;
    console.log("**** cachedData ****", cachedData);

    return cachedData;
  }
  const kvData = await getRecordFromKvCache(kv, cacheKey)
  if(source == 'kv' || kvData){
    console.log("**** getting kv cache ****", kvData);
    return kvData;
  }

  const d1Data = await getD1DataByTable(d1, table, params);


  addToInMemoryCache(cacheKey, { data: d1Data.data, source: "cache" });
  addToKvCache(kv, cacheKey, { data: d1Data.data, source: "kv" });

  // console.log("sql results ==>", results);

  return d1Data;
}


export async function insertRecord(d1, kv, data) {
  const content = { data};
  const id = uuidv4();
  const timestamp = new Date().getTime();
  content.data.id = id;
  let error = '';

  try {
    const result = await saveKVData(
      kv,
      id,
      content.data
    );
    // console.log('result KV', result);
    // return ctx.json(id, 201);
  } catch (error) {
    error = "error posting content" + error;
  } finally {
    //then also save the content to sqlite for filtering, sorting, etc
    try {
      const result = await insertD1Data(
        d1,
        kv,
        content.data.table,
        content.data
      );
      console.log('insertD1Data --->', result)
      return {code: 201, message: result.id};

    } catch (error) {
      error = "error posting content " + content.data.table + error + JSON.stringify(content.data, null, 2);
    }
  }
  return {code: 500, error};

}

export async function updateData(d1, kv, data) {

  const timestamp = new Date().getTime();
  // const result = await saveContent(
  //   ctx.env.KVDATA,
  //   content,
  //   timestamp,
  //   content.id
  // );

  try {
    const result = await saveKVData(
      kv,
      content,
      timestamp,
      content.id
    );
    return ctx.text(content.id, 200);
  } catch (error) {
    console.log("error posting content", error);
    return ctx.text(error, 500);
  } finally {
    //then also save the content to sqlite for filtering, sorting, etc
    try {
      const result = updateData(ctx.env.D1DATA, content.table, content);
    } catch (error) {
      console.log("error posting content", error);
    }
  }

}

export async function deleteData(d1, kv, data) {
}