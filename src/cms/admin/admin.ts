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

admin.get("/", async (ctx) => ctx.html(await loadApis(ctx)));

admin.get("/content/edit/:route/:id", async (ctx) => {
  const route = ctx.req.param("route");
  const id = ctx.req.param("id");
  return ctx.html(await loadEditContent(ctx, route, id));
});

admin.get("/content/new/:route", async (ctx) => {
  const route = ctx.req.param("route");
  return ctx.html(await loadNewContent(ctx, route));
});

admin.get("/tables/:route", async (ctx) => {
  const route = ctx.req.param("route");
  return ctx.html(await loadTableData(ctx, route));
});


export { admin };
