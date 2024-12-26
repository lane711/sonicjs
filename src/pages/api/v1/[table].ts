import qs from "qs";

import type { APIRoute } from "astro";
import { getD1DataByTable } from "../../../services/d1-data";
import { drizzle } from "drizzle-orm/d1";
import { apiConfig, sonicJsConfig } from "../../../db/routes";
import {
  filterCreateFieldAccess,
  filterReadFieldAccess,
  getApiAccessControlResult,
  getItemReadResult,
  getOperationCreateResult,
} from "../../../auth/auth-helpers";
import { deleteRecord, getRecords, insertRecord } from "../../../services/data";
import {
  return204,
  return400,
  return404,
  return500,
} from "../../../services/return-types";
import { hashString } from "@services/cyrpt";
import { kvPut } from "@services/kv";

export const GET: APIRoute = async (context) => {
  const start = Date.now();
  let params: {
    table?: string;
    id?: string;
    accessControlResult?: {};
    limit?: string;
  } = {};
  params = context.params;

  const tableName = params.table;
  let entry;
  try {
    entry = apiConfig.filter((tbl) => tbl.route === tableName)[0];
    if (!entry) {
      throw new Error();
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Table "${tableName}" not defined in your schema`,
      }),
      { status: 500 }
    );
  }

  const { env } = context.locals.runtime;
  // const db = drizzle(env.D1);

  const request = context.request;

  const query =
    request.url.indexOf("?") > 0 ? request.url.split("?")[1] : request.url;
  const queryParams = qs.parse(query, { duplicates: "combine" });

  // console.log("queryParams", queryParams);

  // let data = await getD1DataByTable(env.D1, tableName, queryParams);

  if (entry.hooks?.beforeOperation) {
    await entry.hooks.beforeOperation(context, "read", params.id);
  }

  let accessControlResult = {};
  accessControlResult = (await getApiAccessControlResult(
    entry?.access?.operation?.read || true,
    entry?.access?.filter?.read || true,
    true,
    context,
    params.id,
    entry.table
  )) as {};

  if (typeof accessControlResult === "object") {
    params.accessControlResult = { ...accessControlResult };
  }

  if (!accessControlResult) {
    return new Response(
      JSON.stringify({
        error: `Unauthorized`,
      }),
      { status: 401 }
    );
  }

  try {
    params.limit = params.limit ?? "100";

    // let data = await getD1DataByTable(env.D1, tableName, queryParams);
    let data: {
      data: any;
      source: string;
      total: number;
      contentType?: any;
      executionTime?: number;
    } = await getRecords(
      context,
      entry.table,
      queryParams,
      request.url,
      "fastest",
      undefined
    );

    if (entry.access?.item?.read) {
      const accessControlResult = await getItemReadResult(
        entry.access.item.read,
        context,
        data
      );
      if (!accessControlResult) {
        return return400();
      }
    }
    data.data = await filterReadFieldAccess(
      entry.access?.fields,
      context,
      data.data
    );

    if (entry.hooks?.afterOperation) {
      await entry.hooks.afterOperation(context, "read", params.id, null, data);
    }

    //store in kv cache
    kvPut(context, context.url.href, data);

    const end = Date.now();
    const executionTime = end - start;
    data.executionTime = executionTime;

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        error,
      }),
      { status: 500 }
    );
  }
};

//create single record
//TODO: support batch inserts
export const POST: APIRoute = async (context) => {
  // api.post(`/${entry.route}`, async (ctx) => {
  const { env } = context.locals.runtime;

  const params = context.params;

  const route = params.table;
  let entry;
  try {
    entry = await apiConfig.find((tbl) => tbl.route === route);
    if (!entry) {
      throw new Error(`Table "${route}" not defined in your schema`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Table "${route}" not defined in your schema`,
      }),
      { status: 500 }
    );
  }

  // const db = drizzle(env.D1);

  const request = context.request;

  let content: { data: any; table?: string } = { data: {} };
  content = await request.json();
  // const table = apiConfig.find((entry) => entry.route === route).table;
  // context.env.D1DATA = context.env.D1DATA;

  if (entry?.hooks?.resolveInput?.create) {
    content.data = await entry.hooks.resolveInput.create(context, content.data);
  }

  content.table = entry.table;

  // let authorized = await getOperationCreateResult(
  //   entry?.access?.operation?.create,
  //   content,
  //   content.data
  // );
  // if (!authorized) {
  //   return return400();
  // }

  try {
    // console.log("posting new record content", JSON.stringify(content, null, 2));
    // content.data = await filterCreateFieldAccess(
    //   entry?.access?.fields,
    //   context,
    //   content.data
    // );
    // if (entry?.hooks?.resolveInput?.create) {
    //   content.data = await entry.hooks.resolveInput.create(
    //     context,
    //     content.data
    //   );
    // }

    if (entry.hooks?.beforeOperation) {
      await entry.hooks.beforeOperation(content, "create", undefined, content);
    }

    const result = await insertRecord(env.D1, {}, content);
    console.log("create result", result);

    if (entry?.hooks?.afterOperation) {
      await entry.hooks.afterOperation(
        context,
        "create",
        result?.data?.["id"],
        content,
        result
      );
    }
    return new Response(JSON.stringify(result), {
      status: result?.status || 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("error posting content", error);
    return return500(error);
  }
};

export const DELETE: APIRoute = async (context) => {
  const params = context.params;

  const id = params.id;

  const tableName = params.table;

  let entry;
  try {
    entry = apiConfig.filter((tbl) => tbl.route === tableName)[0];
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Table "${tableName}" not defined in your schema`,
      }),
      { status: 500 }
    );
  }

  // ctx.env.D1DATA = ctx.env.D1DATA;

  // if (entry.hooks?.beforeOperation) {
  //   await entry.hooks.beforeOperation(ctx, 'delete', id);
  // }

  // const accessControlResult = await getApiAccessControlResult(
  //   entry?.access?.operation?.delete || true,
  //   entry?.access?.filter?.delete || true,
  //   entry?.access?.item?.delete || true,
  //   ctx,
  //   id,
  //   entry.table
  // );

  // if (typeof accessControlResult === 'object') {
  //   params = { ...params, ...accessControlResult };
  // }

  // if (!accessControlResult) {
  //   return ctx.text('Unauthorized', 401);
  // }
  // params.id = id;

  // const record = await getRecords(
  //   ctx,
  //   table,
  //   params,
  //   ctx.req.path,
  //   source || 'fastest',
  //   undefined
  // );

  let record = await getRecords(
    context,
    entry.table,
    params,
    context.request.url,
    "fastest",
    undefined
  );

  if (record) {
    console.log("content found, deleting...");
    const result = await deleteRecord(context.locals.runtime.env.D1, {
      id,
      table: tableName,
    });
    // if (entry?.hooks?.afterOperation) {
    //   await entry.hooks.afterOperation(ctx, 'delete', id, record, result);
    // }

    console.log("returning 204");
    return return204();
  } else {
    console.log("content not found");
    return return404();
  }
};

//   //delete
//   api.delete(`/${entry.route}/:id`, async (ctx) => {
//     const id = ctx.req.param('id');
//     const table = ctx.req.path.split('/')[2];
//     ctx.env.D1DATA = ctx.env.D1DATA;

//     if (entry.hooks?.beforeOperation) {
//       await entry.hooks.beforeOperation(ctx, 'delete', id);
//     }

//     let { includeContentType, source, ...params } = ctx.req.query();

//     const accessControlResult = await getApiAccessControlResult(
//       entry?.access?.operation?.delete || true,
//       entry?.access?.filter?.delete || true,
//       entry?.access?.item?.delete || true,
//       ctx,
//       id,
//       entry.table
//     );

//     if (typeof accessControlResult === 'object') {
//       params = { ...params, ...accessControlResult };
//     }

//     if (!accessControlResult) {
//       return ctx.text('Unauthorized', 401);
//     }
//     params.id = id;

//     const record = await getRecords(
//       ctx,
//       table,
//       params,
//       ctx.req.path,
//       source || 'fastest',
//       undefined
//     );

//     if (record) {
//       console.log('content found, deleting...');
//       const result = await deleteRecord(ctx.env.D1DATA, ctx.env.KVDATA, {
//         id,
//         table: table
//       });
//       if (entry?.hooks?.afterOperation) {
//         await entry.hooks.afterOperation(ctx, 'delete', id, record, result);
//       }
//       // const kvDelete = await deleteKVById(ctx.env.KVDATA, id);
//       // const d1Delete = await deleteD1ByTableAndId(
//       //   ctx.env.D1DATA,
//       //   content.data.table,
//       //   content.data.id
//       // );
//       console.log('returning 204');
//       return ctx.text('', 204);
//     } else {
//       console.log('content not found');
//       return ctx.text('', 404);
//     }
//   });
// });