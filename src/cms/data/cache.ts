import loki from "lokijs";
import { log } from "../util/logger";
var db = new loki("cache.db");
var cache = db.addCollection("cache");
var cacheStatus = db.addCollection("cache-status");
var expires;
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
    return expires ?? false;
  },
};

export async function isCacheValid() : Promise<boolean> {
  if(expires === -1){
    return true;
  }

  let expiresOn = LocalCache.getCacheStatus();
  let now = new Date().getTime();
  if (expiresOn && expiresOn > now) {
    return true;
  }
  return false;
}

export async function setCacheStatus(timeToExpireMs) {
  if(timeToExpireMs == -1){
    //never expires
    expires = -1;
    return;
  }
  expires = new Date().getTime() + timeToExpireMs;
  // return LocalCache.getCacheStatus();
}

export async function setCacheStatusInvalid() {
  expires = new Date().getTime() - 1000; //setting to the past
  return LocalCache.getCacheStatus();
}

export async function addToInMemoryCache(
  ctx = {},
  key: string,
  data,
  timeToExpire?: number
) {
  const cache_ttl = (ctx.env && ctx.env.cache_ttl) ?? (10 * 60 * 1000);
  const ttl = timeToExpire ?? cache_ttl;

  // console.log("addToInMemoryCache", key);
  if (ttl > 0) {
    log(ctx, {
      level: "verbose",
      message: "addToInMemoryCache start",
    });
    cache.insert({ key, data });
    await setCacheStatus(ttl);
    log(ctx, {
      level: "verbose",
      message: "addToInMemoryCache end",
    });
  }
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

export async function clearInMemoryCache() {
  console.log("clearing InMemoryCache");
  cache.clear();
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
