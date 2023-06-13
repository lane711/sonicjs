import { Hono } from "hono";
import { getForm, loadForm } from "../admin/forms/form";
import {
  getById,
  getContentTypes,
  getDataByPrefix,
  getDataListByPrefix,
  putData,
  saveContent,
  saveContentType,
} from "../data/kv-data";
import loki from 'lokijs'
import { Bindings } from "../types/bindings";

const inMemory = new Hono<{ Bindings: Bindings }>();
var db = new loki('sandbox.db');

inMemory.get("/", async (c) => {

  var items = db.addCollection('items');
  items.insert({ name : 'mjolnir', owner: 'thor', maker: 'dwarves' });
  items.insert({ name : 'gungnir', owner: 'odin', maker: 'elves' });
  items.insert({ name : 'tyrfing', owner: 'Svafrlami', maker: 'dwarves' });
  items.insert({ name : 'draupnir', owner: 'odin', maker: 'elves' });
  
  let data = items.find({ 'owner': 'odin' });


  return c.json(data);
});



export { inMemory };
