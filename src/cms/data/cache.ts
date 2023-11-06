import loki from "lokijs";
import { log } from "../util/logger";
import {
  getDataByPrefix,
  getKVCache,
  getKVKeys,
  getRecordFromKvCache,
} from "./kv-data";
import { getRecords } from "./data";
var db = new loki("cache.db");
var cache = db.addCollection("cache", {unique: 'key'});

// class CacheStatus {
//   private static _instance: CacheStatus;
//   public static expires: Int16Array;

//   private constructor() {
//     expires = new Date().getTime();
//   }

//   public static get Instance() {
//     // Do you need arguments? Make it a regular static method instead.
//     return this._instance || (this._instance = new this());
//   }
// }

const LocalCache = {
  getCacheStatus() {
    return true;
  },
};

export async function isCacheValid(): Promise<boolean> {
  return true;
}

export async function setCacheStatus(timeToExpireMs) {
  // expires = new Date().getTime() + timeToExpireMs;
  // return LocalCache.getCacheStatus();
}

export async function setCacheStatusInvalid() {
  // expires = new Date().getTime() - 1000; //setting to the past
  // return LocalCache.getCacheStatus();
  //TODO: its really inefficient to just kill the entire cache. We need to only kill the affected cache based on table or guid.
  //We'll need to setup dependency tracking at table and record level
  cache.clear();
}

export async function addToInMemoryCache(ctx = {}, key: string, data) {
  log(ctx, {
    level: "verbose",
    message: "addToInMemoryCache start",
  });
  const existing = await getFromInMemoryCache(ctx, key);
  if (existing.length) {
    let doc = existing[0];
    doc.data = {...data};
    cache.update(doc);
  } else {
    cache.insert({ key, data });
  }
  log(ctx, {
    level: "verbose",
    message: "addToInMemoryCache end",
  });
}

export async function getFromInMemoryCache(ctx = {}, key: string) {
  // console.log("getFromInMemoryCache", key);
  log(ctx, {
    level: "verbose",
    message: "getFromInMemoryCache start",
    key,
  });
  let data = await cache.find({ key: key });
  log(ctx, {
    level: "verbose",
    message: "getFromInMemoryCache end",
    key,
  });
  return data;
}

export async function getAllFromInMemoryCache() {
  let data = await cache;
  return data;
}

export async function getAllCacheItemsFromInMemoryCache() {
  let fullCache = await cache;
  const cacheItems = fullCache.data.filter(
    (item) => item.key.indexOf("cache::") === 0
  );
  return { data: cacheItems, source: "cache" };
}

export async function clearInMemoryCache() {
  console.log("**** clearing InMemoryCache ****");
  cache.clear();
  return true;
}

export async function rehydrateCacheFromKVKeysOnStartup(ctx) {
  // we only want this to run once on start up
  const rehydrateCacheKey = "system::cache-rehydrated";
  const isCacheAlreadyPopulated = await getFromInMemoryCache(
    ctx,
    rehydrateCacheKey
  );
  // console.log("isCacheAlreadyPopulated", isCacheAlreadyPopulated);

  if (isCacheAlreadyPopulated.length) {
    // console.log("cache already populated");
    return;
  } else {
    console.log("rehydrateCacheFromKVKeys ===>");
    const now = new Date().getTime().toString();

    await addToInMemoryCache({}, rehydrateCacheKey, { started: now });

    rehydrateCacheFromKVKeys(ctx);
  }
}
export async function rehydrateCacheFromKVKeys(ctx) {
  const keyData = await getKVKeys(ctx.env.KVDATA);
  if (keyData.keys) {
    for await (const key of keyData.keys) {
      const url = key.metadata.url;
      console.log("==> adding to in memory", url);
      rehydrateCacheItemFromKVKey(ctx, url);
    }
  }
}
export async function rehydrateCacheItemFromKVKey(ctx, url) {
  const data = await getRecordFromKvCache(ctx.env.KVDATA, url);
  // const data = await getRecords(ctx.env.KVDATA, url);

  if (data) {
    data.source = "cache";
    const cacheKey = `cache::${url}`;
    await addToInMemoryCache(ctx, cacheKey, data);
  } else {
    console.error("No kv data found for " + url);
  }
}

export async function rehydrateCacheItemByURLl(ctx, url) {

  let req = new Request(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    let res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    let body = await res.json();

    const data = getRecords(ctx.env.KVDATA, url);
}

// export async function getCacheStatus() {
//   let data = await cache.find({ key: getCacheStatusKey() });
//   return data;}

// export async function setCacheStatus(timeToExpireSeconds) {

//   var expiresOn = new Date().getTime();
//   expiresOn.setSeconds(expiresOn.getSeconds() + timeToExpireSeconds);

//   const data = { expiresOn };

//   // const data = { expiresOn: new Date().getTime()};

//   cache.insert(getCacheStatusKey(), data );

// }

// export async function getCacheStatus(): Promise<boolean> {
//   let result = await cacheStatus.get(1, false);
//   return result && result.data.valid;
// }

// export async function setCacheStatus(timeToExpireSeconds) {
//   // cacheStatus.setTTL(100, 100);
//   const data = { valid: true };
//   return cacheStatus.insert({ key: 1, data });
// }

// export async function getCacheStatus() {
//   let cacheStatus = CacheStatus.Instance;

//   return cacheStatus; // && cacheStatus.valid;
// }

// export async function setCacheStatus(timeToExpireSeconds) {
//   let cacheStatus = CacheStatus.Instance;
//   cacheStatus.expires = new Date().getTime();
//   return cacheStatus
// }

function getCacheStatusKey() {
  return "cache-status";
}
