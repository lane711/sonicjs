import { getAllContent, getByIdAndTable, getByTable, getByTableAndId } from "../../data/d1-data";
import { getById, getContentType, getDataListByPrefix } from "../../data/kv-data";
import { Form, Layout } from "../theme";


export async function loadAdminTable(ctx) {
  // await putData(ctx.env.KVDATA, 'site1', 'content', {title: '20230508a'});

  const content = await getAllContent(ctx.env.D1DATA);
  console.log('content==>', content)

  const contentTypes = await getDataListByPrefix(
    ctx.env.KVDATA,
    "site1::content-type::"
  );

  // console.log("load admin data", content);

  const contentList = content.map((item) => {
    return {
      title: item.name,
      editPath: `/admin/content/edit/users/${item.id}`,
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
      contentTypes={contentTypeList}
      screenTitle="Content"
    />
  );
}

export async function loadTableData(ctx, table) {
  // await putData(ctx.env.KVDATA, 'site1', 'content', {title: '20230508a'});
  console.log('user==>', table)

  const data = await getByTable(ctx.env.D1DATA, table);

  // const content = await getAllContent(ctx.env.D1DATA);
  // console.log('content==>', content)

  // const contentTypes = await getDataListByPrefix(
  //   ctx.env.KVDATA,
  //   "site1::content-type::"
  // );

  // console.log("load admin data", content);

  const contentList = data.map((item) => {
    return {
      title: getDisplayField(item),
      editPath: `/admin/content/edit/${table}/${item.id}`
    };
  });


  return (
    <TopContentTable
      content={contentList}
      screenTitle={table}
    />
  );
}

function getDisplayField(item){
return item.name ?? item.title;
}

export async function loadAdmin(ctx) {
  // await putData(ctx.env.KVDATA, 'site1', 'content', {title: '20230508a'});

  const content = await getDataListByPrefix(ctx.env.KVDATA, "site1::content::");
  // const content = await getAllContent(ctx.env.D1DATA);
  console.log('content==>', content)

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
      contentTypes={contentTypeList}
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

export async function loadEditContent(ctx, table, id) {
  // const content = await getByTableAndId(ctx.env.D1DATA, table, id);
  // console.log("loadEditContent", id, content);

  // console.log('loadEditContent content type', contentType)

  return (
    <ContentEditForm
      saveButtonText="Save Content Type"
      screenTitle="Content Type"
      contentId={id}
    />
  );
}

export async function loadNewContent(ctx, table) {
  // const content = await getByTableAndId(ctx.env.D1DATA, table, id);
  // console.log("loadEditContent", id, content);

  // console.log('loadEditContent content type', contentType)

  return (
    <ContentNewForm
      table={table}
    />
  );
}

function editScript() {  

  return console.log('hello');
}

export const ContentEditForm = (props: {
  screenTitle: string;
  saveButtonText: string;
  contentId: string;
}) => {
  
  return (
    <Layout screenTitle={"Edit: " + props.contentId}>
      <div id="formio" data-id={props.contentId}></div>
    </Layout>
  );
};

export const ContentNewForm = (props: {
  table: string;
}) => {
  
  return (
    <Layout screenTitle={"New: " + props.table}>
      <div id="formio" data-table={props.table}></div>
    </Layout>
  );
};

export const TopContentList = (props: {
  content: object[];
  contentTypes: object[];
  screenTitle: string;
}) => {
  return (
    <Layout screenTitle={props.screenTitle}>
      <div class="row">
        <div class="col-md-8">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Key</th>
              </tr>
            </thead>
            <tbody>
              {props.content.map((item: any) => {
                return (
                  <tr>
                    <th scope="row">
                      {" "}
                      <a class="" href={item.editPath}>
                        {item.title}
                      </a>
                    </th>
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
              {props.contentTypes.map((item: any) => {
                return (
                  <tr>
                    <td>
                      <a class="" href={item.newPath}>
                        New Content: {item.title}
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
}) => {
  return (
    <Layout screenTitle={props.screenTitle}>
      <div class="row">
        <div class="col-md-12">

        <div class="pb-2 mb-3">
          {/* <!-- Button trigger modal --> */}
          <a href={"/admin/content/new/" + props.screenTitle} class="btn btn-warning">
            New {props.screenTitle} record
          </a>
        </div>

          <table class="table">
            <thead>
              <tr>
                <th scope="col">Key</th>
              </tr>
            </thead>
            <tbody>
              {props.content.map((item: any) => {
                return (
                  <tr>
                    <th scope="row">
                      {" "}
                      <a class="" href={item.editPath}>
                        {item.title}
                      </a>
                    </th>
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