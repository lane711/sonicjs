import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { v4 as uuidv4 } from 'uuid';
import { DefaultLogger, LogWriter, eq } from 'drizzle-orm';
import {
  addToInMemoryCache,
  getFromInMemoryCache,
  isCacheValid,
  setCacheStatusInvalid
} from './cache';
import {
  addCachePrefix,
  addToKvCache,
  clearKVCache,
  deleteKVById,
  getRecordFromKvCache,
  saveKVData
} from './kv-data';
import {
  deleteD1ByTableAndId,
  getD1ByTableAndId,
  getD1DataByTable,
  insertD1Data,
  updateD1Data
} from './d1-data';
import { log, timerLog } from '../util/logger';

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

// export async function getRecord(
//   d1,
//   kv,
//   table,
//   params,
//   cacheKey,
//   source = "fastest"
// ) {
//   const cacheStatusValid = await isCacheValid();

//   if (cacheStatusValid) {
//     const cacheResult = await getFromInMemoryCache(cacheKey);
//     // console.log("cacheResult", cacheResult);
//     if (cacheResult && cacheResult.length && source == "fastest") {
//       const cachedData = cacheResult[0].data;
//       // console.log("**** cachedData ****", cachedData);

//       return cachedData;
//     }
//   }

//   const kvData = await getRecordFromKvCache(kv, cacheKey);
//   if (source == "kv" || kvData) {
//     console.log("**** getting kv cache ****", kvData);
//     return kvData;
//   }

//   const d1Data = await getD1ByTableAndId(d1, table, params.id);

//   addToInMemoryCache(cacheKey, { data: d1Data.data, source: "cache" });
//   addToKvCache(kv, cacheKey, { data: d1Data.data, source: "kv" });

//   // console.log("sql results ==>", results);

//   return d1Data;
// }

export async function getRecords(
  ctx,
  table,
  params,
  cacheKey,
  source = 'fastest',
  customDataFunction = undefined
): Promise<{ data: any; source: string; total: number; contentType?: any }> {
  log(ctx, { level: 'verbose', message: 'getRecords start ' + cacheKey });

  const disableCache = ctx.env.disable_cache === 'true';
  const disableKv = ctx.env.disable_kv === 'true';
  console.log('disableCache / disableKv:', disableCache + ' / ' + disableKv);

  //cache
  if (!disableCache) {
    const cacheStart = Date.now();

    const cacheStatusValid = await isCacheValid();
    // console.log("getRecords cacheStatusValid", cacheStatusValid);
    log(ctx, {
      level: 'verbose',
      message: `getRecords cacheStatusValid:${cacheStatusValid}`
    });

    if (cacheStatusValid) {
      log(ctx, {
        level: 'verbose',
        message: 'getRecords getFromInMemoryCache start'
      });
      const cacheResult = await getFromInMemoryCache(ctx, cacheKey);
      log(ctx, {
        level: 'verbose',
        message: `getRecords getFromInMemoryCache end. cacheResult:${
          cacheResult && cacheResult.length
        }`
      });

      // console.log("cacheResult", cacheResult);
      if (cacheResult && cacheResult.length && source == 'fastest') {
        const cachedData = cacheResult[0].data;
        // console.log("**** cachedData ****", cachedData);

        const cacheEnd = Date.now();
        timerLog('cache get', cacheStart, cacheEnd);

        return cachedData;
      }
    }
  }

  //kv
  if (!disableKv) {
    const kvStart = Date.now();

    var executionCtx;
    try {
      executionCtx = ctx.executionCtx;
    } catch (err) {}

    if (source == 'fastest' || source == 'kv') {
      log(ctx, {
        level: 'verbose',
        message: 'getRecords getRecordFromKvCache start'
      });
      const kvData = await getRecordFromKvCache(ctx.env.KVDATA, cacheKey);
      log(ctx, {
        level: 'verbose',
        message: `getRecords getRecordFromKvCache end. kvData:${
          kvData && kvData.length
        }`
      });

      const kvEnd = Date.now();
      timerLog('kv get', kvStart, kvEnd);

      if (kvData) {
        if (!disableCache) {
          dataAddToInMemoryCache(
            ctx,
            executionCtx,
            cacheKey,
            kvData.data,
            kvData.total
          );
          return kvData;
        }
      }
    }
  }

  var d1Data;
  let total = 0;
  if (customDataFunction) {
    log(ctx, {
      level: 'verbose',
      message: 'getRecords customDataFunction start'
    });
    d1Data = await customDataFunction();
    if (d1Data && d1Data[0]) {
      total = d1Data[0].total;
    } else if (Object.keys(d1Data).length) {
      total = 1;
    }
    log(ctx, {
      level: 'verbose',
      message: 'getRecords customDataFunction end'
    });
  } else {
    //d1
    const d1Start = Date.now();

    log(ctx, {
      level: 'verbose',
      message: 'getRecords getD1DataByTable start'
    });
    d1Data = await getD1DataByTable(ctx.env.D1DATA, table, params);
    log(ctx, {
      level: 'verbose',
      message: 'getRecords getD1DataByTable end'
    });
    const d1End = Date.now();
    timerLog('d1 get', d1Start, d1End);
  }

  if (d1Data?.length) {
    total = d1Data[0].total;
  } else if (d1Data) {
    total = 1;
    d1Data.total = undefined;
  }

  // HACK to support int testing
  // if (executionCtx) {
  //   ctx.executionCtx.waitUntil(
  //     addToInMemoryCache(
  //       cacheKey,
  //       { data: d1Data, source: "cache", total },
  //       ctx.env.cache_ttl
  //     )
  //   );
  // } else {
  //   await addToInMemoryCache(
  //     cacheKey,
  //     {
  //       data: d1Data,
  //       source: "cache",
  //       total,
  //     },
  //     ctx.env.cache_ttl
  //   );
  // }
  if (!disableCache) {
    const cacheStart2 = Date.now();

    dataAddToInMemoryCache(ctx, executionCtx, cacheKey, d1Data, total);

    log(ctx, {
      level: 'verbose',
      message: 'getRecords addToInMemoryCache end'
    });
    const cacheEnd2 = Date.now();
    timerLog('cache add', cacheStart2, cacheEnd2);
  }

  //should  be  async
  if (!disableKv) {
    const kvAddStart = Date.now();

    log(ctx, {
      level: 'verbose',
      message: 'getRecords addToKvCache start'
    });

    if (executionCtx) {
      // wait until will ensure the async operation isn't cancelled after the response is sent to  the user 
      ctx.executionCtx.waitUntil(
        await addToKvCache(ctx, ctx.env.KVDATA, cacheKey, {
          data: d1Data,
          source: 'kv',
          total
        })
      );
    } else {
      //for testing
      await addToKvCache(ctx, ctx.env.KVDATA, cacheKey, {
        data: d1Data,
        source: 'kv',
        total
      });
    }

    log(ctx, {
      level: 'verbose',
      message: 'getRecords addToKvCache end'
    });

    const kvAddEnd = Date.now();
    timerLog('kv add', kvAddStart, kvAddEnd);
  }

  log(ctx, { level: 'verbose', message: 'getRecords end', cacheKey });
  return { data: d1Data, source: 'd1', total };
}

async function dataAddToInMemoryCache(
  ctx,
  executionCtx,
  cacheKey,
  data,
  total
) {
  // HACK to support int testing

  if (executionCtx) {
    ctx.executionCtx.waitUntil(
      addToInMemoryCache(ctx, cacheKey, { data, source: 'cache', total })
    );
  } else {
    return addToInMemoryCache(ctx, cacheKey, { data, source: 'cache', total });
  }
}

export async function insertRecord(d1, kv, data) {
  const content = data;
  const id = uuidv4();
  const timestamp = new Date().getTime();
  content.data.id = id;
  let error = '';

  // console.log("insertRecord", content);
  let result = {};
  try {
    result = await saveKVData(kv, id, content.data);
    // console.log('result KV', result);
    // return ctx.json(id, 201);
  } catch (error) {
    console.log('error', error);
    error = 'error posting content' + error;
  } finally {
    //then also save the content to sqlite for filtering, sorting, etc
    try {
      result = await insertD1Data(d1, kv, content.table, content.data);
      // console.log("insertD1Data --->", result);
      //expire cache
      await setCacheStatusInvalid();
      await clearKVCache(kv);

      return { code: 201, data: result };
    } catch (error) {
      error =
        'error posting content ' +
        content.data.table +
        error +
        JSON.stringify(content.data, null, 2);
    }
  }
  return { code: 500, error };
}

export async function updateRecord(d1, kv, data, params: Record<string, any>) {
  try {
    const result = await updateD1Data(d1, data.table, data, params);
    console.log('WTF WTF');
    if ('id' in result && result.id) {
      await saveKVData(kv, data.id, data);
    }
    //expire cache
    await setCacheStatusInvalid();
    await clearKVCache(kv);
    return { code: 200, data: result };
  } catch (error) {
    console.log('error posting content', error);
    return { code: 500, message: error };
  } finally {
    //then also save the content to sqlite for filtering, sorting, etc
    try {
      const result = await updateD1Data(d1, data.table, data);
      //expire cache
      await setCacheStatusInvalid();
      await clearKVCache(kv);
      return { code: 200, data: result };
    } catch (error) {
      console.log('error posting content', error);
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
    console.log('error deleting content', error);
    return { code: 500, message: error };
  }
}
