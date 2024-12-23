export const kvPut = async (context, key, value, options = {}) => {
  try {
    // let value = await context.locals.runtime.env.KV.put('test', JSON.stringify(blogPosts));

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
