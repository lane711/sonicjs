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
import { addToKvCache, getFromKvCache } from "./kv-data";
import { getD1DataByTable } from "./d1-data";


export async function getData(d1, kv, table, params, cacheKey, source = 'fastest') {
  const cacheResult = await getFromInMemoryCache(cacheKey);
  console.log("cacheResult", cacheResult);
  if (cacheResult && cacheResult.length && source == 'fastest') {
    const cachedData = cacheResult[0].data;
    console.log("**** cachedData ****", cachedData);

    return cachedData;
  }
  const kvData = await getFromKvCache(kv, cacheKey)
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
