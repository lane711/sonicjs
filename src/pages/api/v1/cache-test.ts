export const GET = async (context) => {
  const { request } = context;
  const { url } = request;

  const cache = context.locals.runtime.caches.default;

  let cacheFound = false;
  const cacheResponse = await cache.match(url);
  if (cacheResponse) {
    console.log("Cache hit");
    cacheFound = true;
    return cacheResponse;
  } else{
    console.log("Cache miss");

  }

  var response = new Response(
    JSON.stringify({
       "message": "Cache test: " + cacheFound
    }),
    { status: 200 }
  );
  response.headers.set("cache-control", "public, max-age=600000");
  response.headers.set("content-type", "application/json");

  await cache.put(url, new Response(response.body, response));

  return response;
};
