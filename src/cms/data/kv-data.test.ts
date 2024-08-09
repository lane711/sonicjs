import {
  add,
  getKey,
  getDataListByPrefix,
  saveKVData,
  addToKvCache,
  getRecordFromKvCache,
  clearKVCache,
  getKVCache
} from './kv-data';

const env = getMiniflareBindings();

describe('test KV data access tier', () => {
  // it('saveKVData should insert data', async () => {
  //   const rec1 = await saveKVData(
  //     env.KVDATA,
  //     'site',
  //     'ct',
  //     { foo: 'bar' },
  //     '12345'
  //   );
  //   const rec2 = await saveKVData(
  //     env.KVDATA,
  //     'site',
  //     'ct',
  //     { foo: 'bar' },
  //     '23456'
  //   );
  //
  //   const data = await getDataListByPrefix(env.KVDATA, '', 2);
  //   console.log('getDataListByPrefix==>', data);
  //
  //   // expect(key.startsWith("site::module")).toBe(true);
  //   // expect(key.length).toBe(40);
  // });

  saveKVData;
  it('getDataListByPrefix should return data', async () => {
    const data = await getDataListByPrefix(env.KVDATA, '', 2);
    console.log('getDataListByPrefix==>', data);
    // expect(key.startsWith("site::module")).toBe(true);
    // expect(key.length).toBe(40);
  });

  // it("should generate a key", () => {
  //   const key = getKey("site", "module");
  //   console.log(key);
  //   expect(key.startsWith("site::module")).toBe(true);
  //   expect(key.length).toBe(40);
  // });

  // it("should generate a key for a content type", () => {
  //   const key = getKey("", "", "site1::content-type::blog-post");
  //   // console.log(key);
  //   expect(key).toBe("site1::content-type::blog-post");
  // });
});

describe('test KV cache', () => {
  it('addToKvCache should save to kv', async () => {
    await addToKvCache({}, env.KVDATA, '/some-url-key-1', {
      foo: 'bar'
    });
    await addToKvCache({}, env.KVDATA, '/some-url-key-2', {
      foo: 'bear'
    });

    const kvResult1 = await getRecordFromKvCache(env.KVDATA, '/some-url-key-1');
    const kvResult2 = await getRecordFromKvCache(env.KVDATA, '/some-url-key-2');

    // console.log('kvResult1', kvResult1)
    expect(kvResult1).toEqual({
      foo: 'bar'
    });

    expect(kvResult2).toEqual({
      foo: 'bear'
    });

    const allCacheItems = await getKVCache(env.KVDATA);
    console.log('allCacheItems', allCacheItems);

    // //clear cache
    await clearKVCache(env.KVDATA);

    const allCacheItemsAfterClearCache = await getKVCache(env.KVDATA);
    expect(allCacheItemsAfterClearCache.keys.length).toEqual(0);
  });
});
