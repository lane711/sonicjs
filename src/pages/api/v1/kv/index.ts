import { kvGetAll } from "@services/kv";
import { return200 } from "@services/return-types";

export const GET = async (context) => {
  // const start = Date.now();
  let params = context.params;

  //   const tableName = params.table;
  //   let entry;
  //   try {
  //     entry = apiConfig.filter((tbl) => tbl.route === tableName)[0];
  //   } catch (error) {
  //     return new Response(
  //       JSON.stringify({
  //         error: `Table "${tableName}" not defined in your schema`,
  //       }),
  //       { status: 500 }
  //     );
  //   }

  // let { includeContentType, source, ...params } =  context.request.query();

  //   const id = params.id;

  //   if (entry.hooks?.beforeOperation) {
  //     await entry.hooks.beforeOperation(context, "read", id);
  //   }

  // params.id = id;
  // will check the item result when we get the data
  //   const accessControlResult = await getApiAccessControlResult(
  //     entry?.access?.operation?.read || true,
  //     entry?.access?.filter?.read || true,
  //     true,
  //     context,
  //     id,
  //     entry.table
  //   );

  //   if (typeof accessControlResult === "object") {
  //     params = { ...params, ...accessControlResult };
  //   }

  //   if (!accessControlResult) {
  //     return context.text("Unauthorized", 401);
  //   }

  // source = source || 'fastest';
  // if (includeContentType !== undefined) {
  //   source = 'd1';
  // }
  const source = "D1";

  const data = await kvGetAll(context);

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
