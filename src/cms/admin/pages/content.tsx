import { ApiConfig, apiConfig } from '../../../db/routes';
import { getDataListByPrefix } from '../../data/kv-data';
import { Bindings } from '../../types/bindings';
import { Layout } from '../theme';

export async function loadAdminTable(ctx) {
  // await saveKVData(ctx.env.KVDATA, 'site1', 'content', {title: '20230508a'});

  // const content = await getAllContent(ctx.env.D1DATA);
  // const content = await getAllContent(ctx.env.D1DATA);

  let content = await getDataListByPrefix(ctx.env.KVDATA);

  content.keys.reverse();

  console.log('content==>', JSON.stringify(content, null, 2));

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
      newPath: `/admin/content/new/${item.name}`
    };
  });

  // console.log("contentList-->", JSON.stringify(contentList, null, 2));

  return (
    <TopContentList
      content={contentList}
      tableList={apiConfig}
      screenTitle='Content'
      username={ctx.get('user')?.email}
      env={ctx.env}
    />
  );
}

export async function loadTableData(ctx, route) {
  // await saveKVData(ctx.env.KVDATA, 'site1', 'content', {title: '20230508a'});
  // console.log("loadTableData==>", route);
  const table = apiConfig.find((entry) => entry.route === route).table;
  if (ctx._path?.includes('auth')) {
    route = `auth/${route}`;
  }
  // const results = await getD1DataByTable(ctx.env.D1DATA, table, undefined);

  // results.reverse();
  // const content = await getAllContent(ctx.env.D1DATA);
  // console.log('data==>', JSON.stringify(data, null, 2))

  // const contentTypes = await getDataListByPrefix(
  //   ctx.env.KVDATA,
  //   "site1::content-type::"
  // );

  // console.log("load admin data", content);

  // const contentList = results.map((item) => {
  //   return {
  //     id: item.id,
  //     title: getDisplayField(item),
  //     updatedOn: item.updatedOn,
  //     editPath: `/admin/content/edit/${route}/${item.id}`,
  //   };
  // });

  return (
    <TopContentTable
      env={ctx.env}
      username={ctx.get('user')?.email}
      route={route}
      table={table}
    />
  );
}

export async function loadInMemoryCacheTable(ctx) {
  const cache_ttl = (ctx.env && ctx.env.cache_ttl) ?? 20 * 60 * 1000;

  return (
    <Layout
      env={ctx.env}
      username={ctx.get('user')?.email}
      screenTitle={'In Memory Cache'}
    >
      <div class='row'>
        <div class='col-md-12'>
          <div class='pb-2 mb-3'>
            <button id='clear-cache-in-memory' class='btn btn-warning'>
              Clear In Memory Cache
            </button>
          </div>

          <div id='grid-in-memory-cache'></div>
        </div>
      </div>
    </Layout>
  );
}

export async function loadKVCacheTable(ctx) {
  return (
    <Layout
      env={ctx.env}
      username={ctx.get('user')?.email}
      screenTitle={'KV Cache'}
    >
      <div class='row'>
        <div class='col-md-12'>
          <div class='pb-2 mb-3'>
            <button id='clear-cache-kv' class='btn btn-warning'>
              Clear KV Cache
            </button>
          </div>

          <div id='grid-kv-cache'></div>
        </div>
      </div>
    </Layout>
  );
}

export async function loadKVCacheDetail(ctx, kv) {
  return (
    <Layout
      env={ctx.env}
      username={ctx.get('user')?.email}
      screenTitle={'KV Item Detail'}
    >
      <div class='row'>
        <div class='col-md-12'>
          <div class='pb-2 mb-3'>
            <button id='clear-cache-kv' class='btn btn-warning'>
              Clear KV Cache
            </button>
          </div>

          <textarea rows={24} style='width: 100%; max-width: 100%;'>
            {JSON.stringify(kv, null, 2)}
          </textarea>
        </div>
      </div>
    </Layout>
  );
}

export async function loadInMemoryCacheDetail(ctx, kv) {
  return (
    <Layout
      env={ctx.env}
      username={ctx.get('user')?.email}
      screenTitle={'In Memory Item Detail'}
    >
      <div class='row'>
        <div class='col-md-12'>
          <div class='pb-2 mb-3'>
            <button id='clear-in-memory-kv' class='btn btn-warning'>
              Clear In Memory Cache
            </button>
          </div>

          <textarea rows={24} style='width: 100%; max-width: 100%;'>
            {JSON.stringify(kv, null, 2)}
          </textarea>
        </div>
      </div>
    </Layout>
  );
}

function getDisplayField(item) {
  return item.name ?? item.title ?? item.firstName ?? item.id ?? 'record';
}

export async function loadAdmin(ctx) {
  // await saveKVData(ctx.env.KVDATA, 'site1', 'content', {title: '20230508a'});

  const content = await getDataListByPrefix(ctx.env.KVDATA, 'site1::content::');
  // const content = await getAllContent(ctx.env.D1DATA);
  console.log('content==>', content);

  const contentTypes = await getDataListByPrefix(
    ctx.env.KVDATA,
    'site1::content-type::'
  );

  // console.log("load admin data", content);

  const contentList = content.key.map((item) => {
    return {
      title: item.name,
      editPath: `/admin/content/edit/${item.name}`,
      newPath: `/admin/content/new/${item.name}`
    };
  });

  const contentTypeList = contentTypes.keys.map((item) => {
    return {
      table: item.name,
      route: item.name
    };
  });

  return (
    <TopContentList
      env={ctx.env}
      content={contentList}
      tableList={contentTypeList}
      screenTitle='Content'
      username={ctx.get('user')?.email}
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

export async function loadEditContent(ctx, route, id, tbl?: string) {
  // const content = await getD1ByTableAndId(ctx.env.D1DATA, table, id);
  // console.log("loadEditContent", id, content);
  const table = tbl || apiConfig.find((entry) => entry.route === route).table;

  // console.log('loadEditContent content type', contentType)

  return (
    <ContentEditForm
      env={ctx.env}
      saveButtonText='Save Content Type'
      screenTitle='Content Type'
      contentId={id}
      table={table}
      route={route}
      username={ctx.get('user')?.email}
    />
  );
}

export async function loadNewContent(ctx, route, tbl?: string) {
  // const content = await getD1ByTableAndId(ctx.env.D1DATA, table, id);
  // console.log("loadEditContent", id, content);

  const table = tbl || apiConfig.find((entry) => entry.route === route).table;

  console.log('loadNewContent', route, table);

  return (
    <ContentNewForm
      env={ctx.env}
      username={ctx.get('user')?.email}
      route={route}
      table={table}
    />
  );
}

function editScript() {
  return console.log('hello');
}

export const FileModal = () => {
  return (
    <div
      class='modal fade'
      id='fileModal'
      tabindex={-1}
      aria-labelledby='fileModalLabel'
      aria-hidden='true'
    >
      <div class='modal-dialog'>
        <div class='modal-content'>
          <div class='modal-header'>
            <h1 class='modal-title fs-5' id='fileModalLabel'>
              Modal title
            </h1>
            <button
              type='button'
              class='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'
            ></button>
          </div>
          <div class='modal-body'>
            <ul class='nav nav-tabs' id='myTab' role='tablist'>
              <li class='nav-item' role='presentation'>
                <button
                  class='nav-link active'
                  id='image-tab'
                  data-bs-toggle='tab'
                  data-bs-target='#image-tab-pane'
                  type='button'
                  role='tab'
                  aria-controls='image-tab-pane'
                  aria-selected='true'
                >
                  Images
                </button>
              </li>
              <li class='nav-item' role='presentation'>
                <button
                  class='nav-link'
                  id='file-tab'
                  data-bs-toggle='tab'
                  data-bs-target='#file-tab-pane'
                  type='button'
                  role='tab'
                  aria-controls='file-tab-pane'
                  aria-selected='false'
                >
                  Files
                </button>
              </li>
            </ul>
            <div class='tab-content' id='myTabContent'>
              <div
                class='tab-pane fade show active'
                id='image-tab-pane'
                role='tabpanel'
                aria-labelledby='image-tab'
                tabIndex={0}
              >
                <div class='gallery'>
                  <div class='gallery-column'></div>
                  <div class='gallery-column'></div>
                  <div class='gallery-column'></div>
                  <div class='gallery-column'></div>
                </div>
              </div>
              <div
                class='tab-pane fade'
                id='file-tab-pane'
                role='tabpanel'
                aria-labelledby='file-tab'
                tabIndex={0}
              ></div>
            </div>
          </div>
          <div class='modal-footer'>
            <button
              type='button'
              class='btn btn-secondary'
              data-bs-dismiss='modal'
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export const ContentEditForm = (props: {
  screenTitle: string;
  saveButtonText: string;
  contentId: string;
  table: string;
  route: string;
  username?: string;
  env: Bindings;
}) => {
  return (
    <Layout
      env={props.env}
      username={props.username}
      screenTitle={'Edit: ' + props.contentId}
    >
      <div id='formio' data-id={props.contentId} data-route={props.route}></div>
      <FileModal />
    </Layout>
  );
};

export const ContentNewForm = (props: {
  table: string;
  route: string;
  username?: string;
  env: Bindings;
}) => {
  return (
    <Layout
      env={props.env}
      screenTitle={'New: ' + props.table}
      username={props.username}
    >
      <div id='formio' data-route={props.route}></div>
      <FileModal />
    </Layout>
  );
};

export const TopContentList = (props: {
  content: object[];
  tableList: ApiConfig[];
  screenTitle: string;
  username?: string;
  env: Bindings;
}) => {
  return (
    <Layout
      env={props.env}
      username={props.username}
      screenTitle={props.screenTitle}
    >
      <div class='row'>
        <div class='col-md-8'>
          <table class='table'>
            <thead>
              <tr>
                <th scope='col'>Record</th>
                <th scope='col'>Created</th>
                <th scope='col'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.content.map((item: any) => {
                return (
                  <tr>
                    <td scope='row'>
                      {' '}
                      <a class='' href={item.editPath}>
                        {item.title}
                      </a>
                    </td>
                    <td scope='row'>
                      <time class='timeSince' datetime={item.updatedOn}>
                        {item.updatedOn}
                      </time>
                    </td>
                    <td>
                      <a
                        href='javascript:void(0)'
                        data-id={item.id}
                        class='btn btn-outline-warning btn-sm delete-content'
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
        <div class='col-md-4'>
          <table class='table'>
            <thead>
              <tr>
                <th scope='col'>New Content</th>
              </tr>
            </thead>
            <tbody>
              {props.tableList.map((item) => {
                return (
                  <tr>
                    <td>
                      <a
                        href={'/admin/content/new/' + item.route}
                        class='btn btn-warning'
                      >
                        New {item.table} record
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
  table: string;
  route: string;
  username?: string;
  env: Bindings;
}) => {
  return (
    <Layout env={props.env} username={props.username} screenTitle={props.table}>
      <div class='row'>
        <div class='col-md-12'>
          <div class='pb-2 mb-3'>
            {/* <!-- Button trigger modal --> */}
            <a
              href={'/admin/content/new/' + props.route}
              class='btn btn-warning'
            >
              New {props.table} record
            </a>
          </div>
          <div id='grid' data-route={props.table}></div>
          <div id='executionTime' class='p-4 text-center text-muted hide'>
            Data Retrieval - <b>Server</b>: <span class='serverTime'></span>ms,{' '}
            <b>Client</b>: <span class='clientTime'></span>ms. <b>Source</b>:{' '}
            <span class='source'></span>
          </div>

          {/* <table class="table">
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
          </table> */}
        </div>
      </div>
    </Layout>
  );
};
