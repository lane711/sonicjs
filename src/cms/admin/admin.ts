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
import { getRecords } from "../data/data";
import { apiConfig } from "../../db/schema";
import { getD1Binding } from "../util/d1-binding";
import qs from "qs";
import { format, compareAsc } from 'date-fns'

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

admin.get("/api/:route", async (ctx) => {

  const start = Date.now();



  const route = ctx.req.param("route");

  var params = qs.parse(ctx.req.query());
  params.limit = params.limit ?? 1000;


  const table = apiConfig.find((entry) => entry.route === route).table;

  console.log('===> records', route, table)

  const d1 = getD1Binding(ctx);

  const records = await getRecords(
    d1,
    ctx.env.KVDATA,
    table,
    params,
    ctx.req.url,
    "fastest"
  );

  console.log('===> records', records)

  const data = records.data.map((item) => {
    return {
      id: item.id,
      updatedOn: format(item.updatedOn, 'MM/dd/yyyy h:mm b'),
      editLink: `<a href="/admin/content/edit/${route}/${item.id}">${getDisplayField(item)}</a>`,
    };
  });

  const end = Date.now();
  const executionTime = end - start;
  console.log(`Execution time: ${end - start} ms`);

  return ctx.json({data, source: records.source, total: records.total, executionTime});
});

function getDisplayField(item) {
  return item.name ?? item.title ?? item.firstName ?? item.id ?? "record";
}

export { admin };

