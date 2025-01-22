export const kvPut = async (context, key, value, options = {}) => {
  try {
    // let value = await context.locals.runtime.env.KV.put('test', JSON.stringify(blogPosts));
    console.log("adding to kv", key);
    await context.locals.runtime.env.KV.put(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
};

export const kvGet = async (context, key, options = { type: "json" }) => {
  try {
    return context.locals.runtime.env.KV.get(key, options);
  } catch (error) {
    console.error(error);
  }
};

export const kvGetAll = async (context) => {
  try {
    const list = await context.locals.runtime.env.KV.list();
    return JSON.stringify(list.keys);
  } catch (error) {
    console.error(error);
  }
};
