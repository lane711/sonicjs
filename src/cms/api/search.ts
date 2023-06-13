import { Hono } from "hono";
import { getForm, loadForm } from "../admin/forms/form";
import {
  getById,
  getContentType,
  getContentTypes,
  getDataByPrefix,
  getDataListByPrefix,
  putData,
  saveContent,
  saveContentType,
} from "../data/kv-data";
import { Bindings } from "../types/bindings";

const search = new Hono<{ Bindings: Bindings }>();

search.get("/", async (ctx) => {

  console.log('searching data with d1')

  return ctx.json({ok:'ok'});
});

export { search };
