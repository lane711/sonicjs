import { Hono } from "hono";
import qs from "qs";
import { getRecords } from "../cms/data/data";
import * as schema from "../db/schema";
import { drizzle } from "drizzle-orm/d1";
import { getD1Binding } from "../cms/util/d1-binding";
import { sql } from "drizzle-orm";
import { postsTable } from "../db/schema";

const example = new Hono();

example.get("/", (ctx) => {
  return ctx.text("Hello SonicJs!");
});

example.get("/users", async (ctx) => {
  var params = qs.parse(ctx.req.query());
  const data = await getRecords(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "users",
    params,
    ctx.req.url,
    "fastest"
  );
  return ctx.json(data);
});

example.post("/users", async (ctx) => {
  var params = qs.parse(ctx.req.query());
  const data = await getRecords(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "users",
    params,
    ctx.req.url,
    "fastest"
  );
  return ctx.json(data);
});

example.get("/blog-posts-orm", async (ctx) => {
  const start = Date.now();
  var params = qs.parse(ctx.req.query());
  const d1 = getD1Binding(ctx);
  const limit = params.limit ? params.limit : 10;
  const offset = params.offset ? params.offset : 0;

  const func = async function () {
    const db = drizzle(d1, { schema });

    return await db.query.postsTable.findMany({
      with: {
        user: true,
        comments: { with: { user: true } },
        categories: { with: { category: true } },
      },
      limit,
      offset,
      extras: {
        total: sql`COUNT() OVER()`.as("total"),
      },
    });
  };

  const data = await getRecords(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "custom",
    params,
    ctx.req.url,
    "fastest",
    func
  );

  const end = Date.now();
  const executionTime = end - start;

  return ctx.json({ ...data, executionTime });
});

example.get("/blog-posts-old", async (ctx) => {
  const start = Date.now();
  var params = qs.parse(ctx.req.query());
  const d1 = getD1Binding(ctx);

  let limit = params.limit ? params.limit : 10;
  let offset = params.offset ? params.offset : 0;

  const func = async function () {
    const db = drizzle(d1, { schema });

    const sql = `
    SELECT
    posts.id,
    posts.title,
    posts.updatedOn,
    substr(posts.body, 0, 20) as body,
    users.firstName || ' ' || users.lastName as author,
    count(comments.id) as commentCount,
    categories.title as category,
    COUNT() OVER() as total
    FROM posts
    left outer join users
    on posts.userid = users.id
    left outer join comments
    on comments.postId = posts.id
    left outer join categoriesToPosts
    on categoriesToPosts.postId = posts.id
    left outer join categories
    on categoriesToPosts.categoryId = categories.id
    group by posts.id
    order by posts.updatedOn desc
    limit ${limit}
    offset ${offset}
    `;

    const data = await d1.prepare(sql).all();

    return data.results;
  };

  const data = await getRecords(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "custom",
    params,
    ctx.req.url,
    "fastest",
    func,
    ctx
  );

  const end = Date.now();
  const executionTime = end - start;

  return ctx.json({ ...data, executionTime });
});

example.get("/blog-posts2", async (ctx) => {
  const start = Date.now();
  var params = qs.parse(ctx.req.query());
  const d1 = getD1Binding(ctx);

  let limit = params.limit ? params.limit : 10;
  let offset = params.offset ? params.offset : 0;

  const func = async function () {
    const { results } = await d1
      .prepare(
        `
    SELECT
    posts.id,
    posts.title,
    posts.updatedOn,
    substr(posts.body, 0, 20) as body,
    users.firstName || ' ' || users.lastName as author,
    count(comments.id) as commentCount,
    categories.title as category,
    COUNT() OVER() as total
    FROM posts
    left outer join users
    on posts.userid = users.id
    left outer join comments
    on comments.postId = posts.id
    left outer join categoriesToPosts
    on categoriesToPosts.postId = posts.id
    left outer join categories
    on categoriesToPosts.categoryId = categories.id
    group by posts.id
    order by posts.updatedOn desc
    limit 10
    offset 0
    `
      )
      .all();

    return results;
  };

  const data = await getRecords(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "custom",
    params,
    ctx.req.url,
    "fastest",
    func,
    ctx
  );

  const end = Date.now();
  const executionTime = end - start;

  return ctx.json({ ...data, executionTime });
});

example.get("/blog-posts", async (ctx) => {
  const start = Date.now();
  var params = qs.parse(ctx.req.query());
  const d1 = getD1Binding(ctx);

  let limit = params.limit ? params.limit : 10;
  let offset = params.offset ? params.offset : 0;

  const { results } = await d1
    .prepare(
      `
    SELECT
    posts.id,
    posts.title,
    posts.updatedOn,
    substr(posts.body, 0, 20) as body,
    users.firstName || ' ' || users.lastName as author,
    count(comments.id) as commentCount,
    categories.title as category,
    COUNT() OVER() as total
    FROM posts
    left outer join users
    on posts.userid = users.id
    left outer join comments
    on comments.postId = posts.id
    left outer join categoriesToPosts
    on categoriesToPosts.postId = posts.id
    left outer join categories
    on categoriesToPosts.categoryId = categories.id
    group by posts.id
    order by posts.updatedOn desc
    limit 10
    offset ?
    `
    )
    .bind(offset)
    .all();

const total = results[0].total;

  const end = Date.now();
  const executionTime = end - start;

  return ctx.json({ data: results, executionTime, source: "d1", total });
});

example.get("/blog-posts/:id", async (ctx) => {
  const start = Date.now();
  const id = ctx.req.param("id");
  var params = qs.parse(ctx.req.query());
  const d1 = getD1Binding(ctx);

  const table = "posts";

  const func = async function () {
    const db = drizzle(d1, { schema });

    const data = await d1
      .prepare(
        `
    SELECT
    posts.id,
    posts.title,
    posts.updatedOn,
    posts.body,
    users.firstName || ' ' || users.lastName as author,
    group_concat(comments.id, ',') as comments,
    categories.title as category
    FROM posts
    left outer join users
    on posts.userid = users.id
    left outer join comments
    on comments.postId = posts.id
    left outer join categoriesToPosts
    on categoriesToPosts.postId = posts.id
    left outer join categories
    on categoriesToPosts.categoryId = categories.id
    where posts.id = '${id}'
    `
      )
      .all();

    const post = data.results[0];

    post.comments = post.comments.split(",");

    return post;
  };

  const data = await getRecords(
    ctx.env.D1DATA,
    ctx.env.KVDATA,
    "custom",
    params,
    ctx.req.url,
    "fastest",
    func
  );

  const end = Date.now();
  const executionTime = end - start;

  return ctx.json({ ...data, executionTime });
});

export { example };
