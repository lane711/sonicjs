import { ApiConfig, apiConfig } from "../../../db/schema";
import {
  getAllContent,
  getByIdAndTable,
  getD1ByTableAndId,
  getD1DataByTable,
} from "../../data/d1-data";
import {
  getById,
  getContentType,
  getDataListByPrefix,
} from "../../data/kv-data";
import { Form, Layout } from "../theme";

export async function loadAdminTable(ctx) {
  // await saveKVData(ctx.env.KVDATA, 'site1', 'content', {title: '20230508a'});

  // const content = await getAllContent(ctx.env.D1DATA);
  // const content = await getAllContent(ctx.env.D1DATA);

  let content = await getDataListByPrefix(ctx.env.KVDATA);

  content.keys.reverse();

  console.log("content==>", JSON.stringify(content, null, 2));

  // console.log("load admin data", content);

  const contentList = content.keys.map((item) => {
    const id = item.metadata.id;
    const route = item.metadata.route;
    // const table = item.name.split('::')[1];
    // console.log("item-->", JSON.stringify(item, null, 2));

    const updatedOn = item.metadata.updatedOn;
    // console.log("updatedOn-->", updatedOn);

    return {
      id: item.name,
      title: item.name,
      updatedOn: updatedOn,
      editPath: `/admin/content/edit/${route}/${id}`,
      newPath: `/admin/content/new/${item.name}`,
    };
  });

  // console.log("contentList-->", JSON.stringify(contentList, null, 2));

  const tables = apiConfig;
  const tableList = tables.map((schmea) => {
    return {
      title: schmea.table,
      editPath: `/admin/content/${schmea.route}`,
      newPath: `/admin/content/new/${schmea.route}`,
    };
  });

  return (
    <TopContentList
      content={contentList}
      tableList={tableList}
      screenTitle="Content"
    />
  );
}

export async function loadTableData(ctx, route) {
  // await saveKVData(ctx.env.KVDATA, 'site1', 'content', {title: '20230508a'});
  console.log("loadTableData==>", route);
  const table = apiConfig.find((entry) => entry.route === route).table;

  const results = await getD1DataByTable(ctx.env.D1DATA, table, undefined);

  results.reverse();
  // const content = await getAllContent(ctx.env.D1DATA);
  // console.log('data==>', JSON.stringify(data, null, 2))

  // const contentTypes = await getDataListByPrefix(
  //   ctx.env.KVDATA,
  //   "site1::content-type::"
  // );

  // console.log("load admin data", content);

  const contentList = results.map((item) => {
    return {
      id: item.id,
      title: getDisplayField(item),
      updatedOn: item.updatedOn,
      editPath: `/admin/content/edit/${route}/${item.id}`,
    };
  });

  return (
    <TopContentTable content={contentList} route={route} screenTitle={table} />
  );
}

function getDisplayField(item) {
  return item.name ?? item.title ?? item.firstName ?? item.id ?? "record";
}

export async function loadAdmin(ctx) {
  // await saveKVData(ctx.env.KVDATA, 'site1', 'content', {title: '20230508a'});

  const content = await getDataListByPrefix(ctx.env.KVDATA, "site1::content::");
  // const content = await getAllContent(ctx.env.D1DATA);
  console.log("content==>", content);

  const contentTypes = await getDataListByPrefix(
    ctx.env.KVDATA,
    "site1::content-type::"
  );

  // console.log("load admin data", content);

  const contentList = content.key.map((item) => {
    return {
      title: item.name,
      editPath: `/admin/content/edit/${item.name}`,
      newPath: `/admin/content/new/${item.name}`,
    };
  });

  const contentTypeList = contentTypes.keys.map((item) => {
    return {
      title: item.name,
      editPath: `/admin/content/${item.name}`,
      newPath: `/admin/content/new/${item.name}`,
    };
  });

  return (
    <TopContentList
      content={contentList}
      tableList={contentTypeList}
      screenTitle="Content"
    />
  );
}

// export async function loadNewContent(ctx, id) {
//   console.log("loadContent id", id);

//   const data = await getById(ctx.env.KVDATA, id);
//   console.log("loadContent--????", id, data);
//   const contentType = getContentType(data);
//   return (
//     <Form
//       title={contentType}
//       saveButtonText="Save Content Type"
//       screenTitle="Content Type"
//     />
//   );
// }

export async function loadEditContent(ctx, route, id) {
  // const content = await getD1ByTableAndId(ctx.env.D1DATA, table, id);
  // console.log("loadEditContent", id, content);
  const table = apiConfig.find((entry) => entry.route === route).table;

  // console.log('loadEditContent content type', contentType)

  return (
    <ContentEditForm
      saveButtonText="Save Content Type"
      screenTitle="Content Type"
      contentId={id}
      table={table}
      route={route}
    />
  );
}

export async function loadNewContent(ctx, route) {
  // const content = await getD1ByTableAndId(ctx.env.D1DATA, table, id);
  // console.log("loadEditContent", id, content);

  const table = apiConfig.find((entry) => entry.route === route).table;

  console.log("loadNewContent", route, table);

  return <ContentNewForm route={route} table={table} />;
}

function editScript() {
  return console.log("hello");
}

export const ContentEditForm = (props: {
  screenTitle: string;
  saveButtonText: string;
  contentId: string;
  table: string;
  route: string;
}) => {
  return (
    <Layout screenTitle={"Edit: " + props.contentId}>
      <div id="formio" data-id={props.contentId} data-route={props.route}></div>
    </Layout>
  );
};

export const ContentNewForm = (props: { table: string; route: string }) => {
  return (
    <Layout screenTitle={"New: " + props.table}>
      <div id="formio" data-route={props.route}></div>
    </Layout>
  );
};

export const TopContentList = (props: {
  content: object[];
  tableList: ApiConfig[];
  screenTitle: string;
}) => {
  return (
    <Layout screenTitle={props.screenTitle}>
      <div class="row">
        <div class="col-md-8">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Record</th>
                <th scope="col">Created</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.content.map((item: any) => {
                return (
                  <tr>
                    <td scope="row">
                      {" "}
                      <a class="" href={item.editPath}>
                        {item.title}
                      </a>
                    </td>
                    <td scope="row">
                      <time class="timeSince" datetime={item.updatedOn}>
                        {item.updatedOn}
                      </time>
                    </td>
                    <td>
                      <a
                        href="javascript:void(0)"
                        data-id={item.id}
                        class="btn btn-outline-warning btn-sm delete-content"
                        onClick="return confirm('Delete forever?') ? updateContent(data-id) : false;"
                      >
                        Delete
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div class="col-md-4">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">New Content</th>
              </tr>
            </thead>
            <tbody>
              {props.tableList.map((item: any) => {
                return (
                  <tr>
                    <td>
                      <a
                        href={"/admin/content/new/" + item.route}
                        class="btn btn-warning"
                      >
                        New {item.title} record
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export const TopContentTable = (props: {
  content: object[];
  screenTitle: string;
  route: string;
}) => {
  return (
    <Layout screenTitle={props.screenTitle}>
      <div class="row">
        <div class="col-md-12">
          <div class="pb-2 mb-3">
            {/* <!-- Button trigger modal --> */}
            <a
              href={"/admin/content/new/" + props.route}
              class="btn btn-warning"
            >
              New {props.screenTitle} record
            </a>
          </div>

          <div id="grid" data-table={props.screenTitle}></div>

          <table class="table">
            <thead>
              <tr>
                <th scope="col">Record</th>
                <th scope="col">Created</th>
              </tr>
            </thead>
            <tbody>
              {props.content.map((item: any) => {
                return (
                  <tr>
                    <td scope="row">
                      {" "}
                      <a class="" href={item.editPath}>
                        {item.title}
                      </a>
                    </td>
                    <td scope="row">
                      <time class="timeSince" datetime={item.updatedOn}>
                        {item.updatedOn}
                      </time>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
