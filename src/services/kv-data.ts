import { insertD1Data } from "./d1-data";
import { insertRecord } from "./data";

export const cacheRequestInsert = async (context, d1, kv, url) => {
  try {
    const data = { url: url };
    insertD1Data(d1, kv, "cacheRequests", data);
  } catch (error) {
    console.error(error);
  }
};
