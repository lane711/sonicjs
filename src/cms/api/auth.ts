import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { getD1Binding } from "../util/d1-binding";
import { createUser } from "../lucia";
import { insertRecord } from "../data/data";

const authAPI = new Hono<{ Bindings: Bindings }>();

authAPI.post(`/users`, async (ctx) => {
  const content = await ctx.req.json();
  const route = ctx.req.path.split("/")[2];
  const table = "users";

  content.table = table;

  try {
    return await createUser({ content, ctx });
  } catch (error) {
    console.log("error posting content", error);
    return ctx.text(error, 500);
  }
});

export { authAPI };
