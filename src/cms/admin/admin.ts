// import { Hono } from 'hono'
// const app = new Hono()

import { Hono } from "hono";
import { loadForm } from "./forms/form";

import { Bindings } from "../types/bindings";
import {
  loadAdmin,
  loadAdminTable,
  loadEditContent,
  loadNewContent,
  loadTableData,
} from "./pages/content";

import { loadApis } from "./pages/api";
const admin = new Hono<{ Bindings: Bindings }>();

admin.get("/ping", (ctx) => {
  console.log("testing ping", Date());
  return ctx.text(Date());
});

admin.get("/", async (ctx) => ctx.html(await loadAdminTable(ctx)));

admin.get("/content/edit/:table/:id", async (ctx) => {
  const table = ctx.req.param("table");
  const id = ctx.req.param("id");
  return ctx.html(await loadEditContent(ctx, table, id));
});

admin.get("/content/new/:table", async (ctx) => {
  const table = ctx.req.param("table");
  return ctx.html(await loadNewContent(ctx, table));
});

admin.get("/tables/:table", async (ctx) => {
  const table = ctx.req.param("table");
  return ctx.html(await loadTableData(ctx, table));
});

admin.get("/api", async (ctx) => ctx.html(await loadApis(ctx)));

export { admin };
