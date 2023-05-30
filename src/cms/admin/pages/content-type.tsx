import { getById, getContentType, getDataListByPrefix } from "../../data/data";
import { Form, FormBuilder, Layout } from "../theme";

export async function loadContentTypes(context) {
    // console.log("loadContentTypes KVDATA", context.env.KVDATA);
  
    const data = await getDataListByPrefix(context.env.KVDATA, "site1::content-type");
    // console.log("data", data);
  
    const list = data.keys.map((item) => {
      return {
        title: item.name,
        path: `/admin/content-type/edit/${item.name}`,
        newPath: `/admin/content/new/${item.name}`,
  
      };
    });
  
    return (
      <ContentTypeList
        items={list}
        screenTitle="Content Types"
        newItemButtonText="New Content Type"
        link="/admin/content-type/new"
      />
    );
  }
  
  export async function loadContentTypeNew(context) {
    // console.log("loadContentTypes KVDATA", context.env.KVDATA);
  
    const data = await getDataListByPrefix(context.env.KVDATA, "site1::content-type");
    // console.log("data", data);
  
    const list = data.keys.map((item) => {
      return {
        title: item.name,
        path: `/admin/content-types/${item.name}`,
      };
    });
  
    return (
      <Form
        saveButtonText="Save Content Type"
        screenTitle="New Content Type"
        title=""
      />
    );
  }
  
  export async function loadContentType(context, id) {
    const data = await getById(context.env.KVDATA, id);
    const contentType = getContentType(data);
    return (
      <FormBuilder
        title={contentType}
        saveButtonText="Save Content Type"
        screenTitle="Content Type"
      />
    );
  }

  export const ContentTypeList = (props: {
    items: object[];
    screenTitle: string;
    link: string;
    newItemButtonText:string;
  }) => {
    return (
      <Layout screenTitle={props.screenTitle}>
        <div class="pb-2 mb-3">
          {/* <!-- Button trigger modal --> */}
          <a href={props.link} class="btn btn-warning">
            {props.newItemButtonText}
          </a>
        </div>
  
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Edit</th>
              <th scope="col">New Content</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((item: any) => {
              return (
                <tr>
                  <th scope="row">
                    {" "}
                    <a class="" href={item.path}>
                      {item.title}
                    </a>
                  </th>
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
  
      </Layout>
    );
  };