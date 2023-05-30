// import { Hono } from 'hono'
// const app = new Hono()

import { Hono } from "hono";
import { loadForm } from "./forms/form";
import { loadSite, loadSites } from "./pages/sites";


import { Bindings } from "../types/bindings";
import { loadAdmin, loadEditContent, loadNewContent } from "./pages/content";
import { loadModule, loadModules } from "./pages/module";
import { loadContentType, loadContentTypeNew, loadContentTypes } from "./pages/content-type";
const admin = new Hono<{ Bindings: Bindings }>();

// const html = `
// <!DOCTYPE html>
// <html>
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width,initial-scale=1">
//     <title>Todos</title>
//     <link href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet"></link>
//   </head>
//   <body class="bg-blue-100">
//     <div class="w-full h-full flex content-center justify-center mt-8">
//       <div class="bg-white shadow-md rounded px-8 pt-6 py-8 mb-4">
//         <h1 class="block text-grey-800 text-md font-bold mb-2">Todos</h1>
//         <div class="flex">
//           <input class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-800 leading-tight focus:outline-none focus:shadow-outline" type="text" name="name" placeholder="A new todo"></input>
//           <button class="bg-blue-500 hover:bg-blue-800 text-white font-bold ml-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline" id="create" type="submit">Create</button>
//         </div>
//         <div class="mt-4" id="todos"></div>
//       </div>
//     </div>
//   </body>
// </html>
// `

//   export default app

admin.get("/ping", (ctx) => {
  return ctx.text(Date());
});

admin.get("/", async (ctx) => ctx.html(await loadAdmin(ctx)));

admin.get("/content/new/:contentType", async (ctx) => {
  const id = ctx.req.param("contentType");
  return ctx.html(await loadNewContent(ctx, id));
});

admin.get("/content/edit/:contentId", async (ctx) => {
  const id = ctx.req.param("contentId");
  return ctx.html(await loadEditContent(ctx, id));
});

admin.get("/sites", async (ctx) => ctx.html(await loadSites(ctx)));
// admin.get("/sites/*", async (ctx) => ctx.html(await loadSite(ctx)));

admin.get("/modules", async (ctx) => ctx.html(await loadModules(ctx)));
admin.get("/modules/*", async (ctx) => ctx.html(await loadModule(ctx)));

admin.get("/content-types", async (ctx) =>
  ctx.html(await loadContentTypes(ctx))
);
admin.get("/content-type/new", async (ctx) =>
  ctx.html(await loadContentTypeNew(ctx))
);
admin.get("/content-type/edit/:contentType", async (ctx) => {
  const id = ctx.req.param("contentType");

  return ctx.html(await loadContentType(ctx, id));
});

// app.get("/api/forms", async (ctx) => ctx.html(await loadForm(ctx)));

// app.get("/api/form-components", async (ctx) => {
//   return ctx.json(await getForm());
// });

export { admin };
