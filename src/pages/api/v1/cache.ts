import { return200 } from "@services/return-types";
import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const start = Date.now();
  let params = context.params;
  console.log("params", params);
  console.log("context.url", context.url);
  return new Response(JSON.stringify({ url: "checj" }), {
    headers: { "Content-Type": "application/json" },
  });
};
