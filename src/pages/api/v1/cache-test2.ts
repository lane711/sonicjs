export const GET = async (context) => {
  const { request } = context;
  const cacheKey = "somestring";
  let data = [{ status: "no match" }];


  const customCache =  context.locals.runtime.caches
      .open("v1")
      .then((cache) =>
        cache.addAll([
          "/",
          "/index.html",
          "/style.css",
          "/app.js",
          "/image-list.js",
          "/star-wars-logo.jpg",
          "/gallery/bountyHunters.jpg",
          "/gallery/myLittleVader.jpg",
          "/gallery/snowTroopers.jpg",
        ]),
      );

  // let myCache = await caches.open("custom:cache");
  // const found = await myCache.match(cacheKey);
  // myCache.put(cacheKey, new Response(JSON.stringify(data), { status: 200 }));

  const cache = context.locals.runtime.caches;
  let match = await cache.match(cacheKey);

  if (!match) {
    const blogData = [
      {
        id: 1,
        title: "Understanding JavaScript Closures",
        content:
          "A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).",
        author: "John Doe",
        date: "2023-10-02",
      },
      {
        id: 2,
        title: "A Guide to TypeScript Generics",
        content:
          "Generics provide a way to make components work with any data type and not restrict to one data type.",
        author: "Jane Smith",
        date: "2023-10-02",
      },
      {
        id: 3,
        title: "Exploring the New Features in ES2023",
        content:
          "ES2023 introduces several new features and improvements to the JavaScript language, including new syntax and built-in methods.",
        author: "Alice Johnson",
        date: "2023-10-03",
      },
    ];

    // context.locals.runtime.ctx.waitUntil(cache.put(cacheKey, blogData));
    cache.put(cacheKey, blogData);
  } else {
    data = await match.json();
  }
  return new Response(JSON.stringify(data), { status: 200 });
};
