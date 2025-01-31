export const kvPut = async (context, key, value, options = {}) => {
  try {
    // let value = await context.locals.runtime.env.KV.put('test', JSON.stringify(blogPosts));
    console.log("adding to kv", key);
    const now = new Date().getTime();
    await context.locals.runtime.env.KV.put(key, JSON.stringify(value), {
      metadata: { updatedOn: now },
    });
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
    return list.keys;
  } catch (error) {
    console.error(error);
  }
};

export const kvDelete = async (context, key) => {
  try {
    return context.locals.runtime.env.KV.delete(key);
  } catch (error) {
    console.error(error);
  }
};

export const kvPurgeAll = async (context) => {
  try {
    const list = await context.locals.runtime.env.KV.list();
    for (const key of list.keys) {
      await context.locals.runtime.env.KV.delete(key.name);
    }
    return { status: "success" };
  } catch (error) {
    console.error(error);
  }
};
