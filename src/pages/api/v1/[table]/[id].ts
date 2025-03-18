import qs from "qs";

import type { APIRoute } from "astro";
import { getD1DataByTable } from "../../../../services/d1-data";
import { drizzle } from "drizzle-orm/d1";
import { apiConfig, sonicJsConfig } from "../../../../db/routes";
// import {
//   filterCreateFieldAccess,
//   filterReadFieldAccess,
//   getApiAccessControlResult,
//   getItemReadResult,
//   getOperationCreateResult,
// } from "../../../auth/auth-helpers";
import {
  deleteRecord,
  getRecords,
  insertRecord,
  updateRecord,
} from "../../../../services/data";
import {
  filterUpdateFieldAccess,
  getApiAccessControlResult,
} from "../../../../auth/auth-helpers";
import {
  return200,
  return204,
  return401,
  return404,
  return500,
} from "../../../../services/return-types";
import { checkToken } from "@services/token";

//get single record
export const GET = async (context) => {
  // const start = Date.now();
  let params = context.params;

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

  // let { includeContentType, source, ...params } =  context.request.query();

  const id = params.id;

  if (entry.hooks?.beforeOperation) {
    await entry.hooks.beforeOperation(context, "read", id);
  }

  // params.id = id;
  // will check the item result when we get the data
  const accessControlResult = await getApiAccessControlResult(
    entry?.access?.operation?.read ?? false,
    entry?.access?.filter?.read  ?? false,
    true,
    context,
    id,
    entry.table
  );

  if (typeof accessControlResult === "object") {
    params = { ...params, ...accessControlResult };
  }

  if (!accessControlResult) {
    return context.text("Unauthorized", 401);
  }

  // source = source || 'fastest';
  // if (includeContentType !== undefined) {
  //   source = 'd1';
  // }
  const source = "D1";

  let data = await getRecords(
    context,
    entry.table,
    params,
    context.request.url,
    source,
    undefined
  );

  // if (entry.access?.item?.read) {
  //   const accessControlResult = await getItemReadResult(
  //     entry.access.item.read,
  //     context,
  //     data
  //   );
  //   if (!accessControlResult) {
  //     return context.text('Unauthorized', 401);
  //   }
  // }
  // data = await filterReadFieldAccess(entry.access?.fields, context, data);
  // if (includeContentType !== undefined) {
  //   data.contentType = getForm(context, entry.table);
  // }

  // if (entry.hooks?.afterOperation) {
  //   await entry.hooks.afterOperation(context, 'read', id, null, data);
  // }

  // const end = Date.now();
  // const executionTime = end - start;

  return return200(data);
};

export const PUT: APIRoute = async (context) => {
  const { env } = context.locals.runtime;

  var params = context.params;

  const route = params.table;
  let entry;
  try {
    entry = apiConfig.filter((tbl) => tbl.route === route)[0];
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Table "${route}" not defined in your schema`,
      }),
      { status: 500 }
    );
  }

  const payload = await context.request.json();

  var content: { data?: any; table?: string; id?: string } = {};
  content = payload;

  // console.log("put content", JSON.stringify(content.data, null, 2));

  if (entry.hooks?.beforeOperation) {
    await entry.hooks?.beforeOperation(context, "update", params.id, content);
  }

  const accessControlResult = await getApiAccessControlResult(
    entry?.access?.operation?.update ?? false,
    entry?.access?.filter?.update ?? false,
    entry?.access?.item?.update ?? false,
    context,
    params.id,
    entry.table,
    content.data
  );

  // if (typeof accessControlResult === "object") {
  //   params = { ...params, ...accessControlResult };
  // }

  if (!accessControlResult) {
    return return401();
  }

  // const route = context.request.path.split('/')[2];
  // const table = apiConfig.find((entry) => entry.route === route).table;

  content.table = entry.table;
  content.id = params.id;

  try {
    content.data = await filterUpdateFieldAccess(
      entry.access?.fields,
      context,
      params.id,
      content.data
    );
    if (entry?.hooks?.resolveInput?.update) {
      // content.data = await entry.hooks.resolveInput.update(
      //   context,
      //   params.id,
      //   content.data
      // );
    }
    delete params.table;
    const result = await updateRecord(
      context.locals.runtime.env.D1,
      {},
      content,
      params
    );
    if (entry?.hooks?.afterOperation) {
      await entry.hooks.afterOperation(
        context,
        "update",
        params.id,
        content,
        result
      );
    }
    return return200(result.data);
  } catch (error) {
    console.log("error updating content", error);
    return return500(error);
  }

  return return200();
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

  // context.env.D1DATA = context.env.D1DATA;

  if (entry.hooks?.beforeOperation) {
    await entry.hooks.beforeOperation(context, "delete", id);
  }

  const accessControlResult = await getApiAccessControlResult(
    entry?.access?.operation?.delete ?? true,
    entry?.access?.filter?.delete ?? true,
    entry?.access?.item?.delete ?? true,
    context,
    id,
    entry.table
  );

  // if (typeof accessControlResult === 'object') {
  //   params = { ...params, ...accessControlResult };
  // }

  if (!accessControlResult) {
    return return401();
  }
  // params.id = id;

  // const record = await getRecords(
  //   context,
  //   table,
  //   params,
  //    context.request.path,
  //   source || 'fastest',
  //   undefined
  // );

  let record = await getRecords(
    context,
    entry.table,
    { id: params.id },
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
    //   await entry.hooks.afterOperation(context, 'delete', id, record, result);
    // }

    return new Response(JSON.stringify(result), {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });

    // console.log("returning 204");
    // return return204();
  } else {
    console.log("content not found");
    return return404();
  }
};
