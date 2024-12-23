var InMemoryCache = [];
export const inMemoryPut = async (context, key, value, options = {}) => {
  try {
    // let value = await context.locals.runtime.env.KV.put('test', JSON.stringify(blogPosts));
    console.log("adding to kv", key);
    // context.locals.runtime.ctx.waitUntil((async () => {
    // await context.locals.runtime.env.KV.put(key, JSON.stringify(value));
    InMemoryCache.push({ key, value });
  } catch (error) {
    console.error(error);
  }
};

export const inMemoryGet = async (context, key, options = { type: "json" }) => {
  try {
    return InMemoryCache.find((item) => item.key === key)?.value;
  } catch (error) {
    console.error(error);
  }
};
