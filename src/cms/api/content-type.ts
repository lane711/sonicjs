import { Hono } from "hono";
import { getForm, loadForm } from "../admin/forms/form";
import {
  getById,
  getDataByPrefix,
  getDataListByPrefix,
  putData,
  saveContent,
  saveContentType,
} from "../data/data";
import { Bindings } from "../types/bindings";

const contentType = new Hono<{ Bindings: Bindings }>();

contentType.get("/:contentType", async (c) => {
  const id = c.req.param("contentType");

  console.log("contentType--->", id);

  const ct = await getById(c.env.KVDATA, `${id}`);
  return c.json(ct);
});

contentType.post("/", async (c) => {
  const formComponents = await c.req.json();

  console.log("formComponents-->", formComponents);
  //put in kv
  const result = await saveContentType(c.env.KVDATA, "site1", formComponents);

  console.log("form put", result);
  return c.text("Created!", 201);
});

export { contentType };
