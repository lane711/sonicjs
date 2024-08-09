import loki from 'lokijs';
import { log } from '../util/logger';
var db = new loki('cache.db');
var cache = db.addCollection('cache');

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
  }
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
    level: 'verbose',
    message: 'addToInMemoryCache start'
  });
  cache.insert({ key, data });
  log(ctx, {
    level: 'verbose',
    message: 'addToInMemoryCache end'
  });
}

export async function getFromInMemoryCache(ctx = {}, key: string) {
  // console.log("getFromInMemoryCache", key);
  log(ctx, {
    level: 'verbose',
    message: 'getFromInMemoryCache start',
    key
  });
  let data = await cache.find({ key: key });
  log(ctx, {
    level: 'verbose',
    message: 'getFromInMemoryCache end',
    key
  });
  return data;
}

export async function getAllFromInMemoryCache() {
  let data = await cache;
  return data;
}

export async function clearInMemoryCache() {
  console.log('clearing InMemoryCache');
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
  return 'cache-status';
}
