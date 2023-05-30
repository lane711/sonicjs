import { getById, getContentType, getDataListByPrefix } from "../../data/data";
import { Form, Layout } from "../theme";

export async function loadAdmin(context) {
  // await putData(context.env.KVDATA, 'site1', 'content', {title: '20230508a'});

  const content = await getDataListByPrefix(context.env.KVDATA, "site1::content::");
  const contentTypes = await getDataListByPrefix(
    context.env.KVDATA,
    "site1::content-type::"
  );

  // console.log("load admin data", content);

  const contentList = content.keys.map((item) => {
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

export async function loadNewContent(context, id) {
  console.log("loadContent id", id);

  const data = await getById(context.env.KVDATA, id);
  console.log("loadContent--????", id, data);
  const contentType = getContentType(data);
  return (
    <Form
      title={contentType}
      saveButtonText="Save Content Type"
      screenTitle="Content Type"
    />
  );
}

export async function loadEditContent(context, id) {
  const content = await getById(context.env.KVDATA, id);
  // console.log("loadEditContent", id, content);

  // console.log('loadEditContent content type', contentType)

  return (
    <ContentEditForm
      title={content}
      saveButtonText="Save Content Type"
      screenTitle="Content Type"
      contentId={id}
    />
  );
}

function editScript() {  

  return console.log('hello');
}

export const ContentEditForm = (props: {
  title: string;
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
