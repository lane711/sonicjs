import { getById, getDataListByPrefix, putData } from "../../data/data";
import { Layout } from "../theme";

interface link {
  url: string;
  description: string;
}

export async function loadApis(ctx) {
  const sites = await getDataListByPrefix(ctx.env.KVDATA, "host::sites");

  let contentTypeApis: link[] = [
    { url: "/v1/content-type", description: "Get All Content Types" },
    { url: "/v1/content-type/site1::content-type::blog", description: "Get Content Type" },
  ];

  let contentListApis: link[] = [
    { url: "/v1/content", description: "Get All Content" },
    { url: "/v1/content?includeContentType", description: "Include Content Type" },
    { url: "/v1/content?contentType=blog", description: "Get Content by Content Type" },
    { url: "/v1/content?keysOnly", description: "Return Only Keys" },
    { url: "/v1/content?limit=10", description: "Page Results" },
  ];

  let contentApis: link[] = [
    { url: "/v1/content/site1::content::article::16857474370560000::bpsxzzu", description: "Get Single Record" },
    { url: "/v1/content/site1::content::article::16857474370560000::bpsxzzu?includeContentType", description: "Include Content Type" },
  ];

  return (
    <Top
      contentTypeApis={contentTypeApis}
      contentListApis={contentListApis}
      contentApis={contentApis}
      screenTitle="APIs"
    />
  );
}

export const Top = (props: {
  contentTypeApis: link[];
  contentListApis: link[];
  contentApis: link[];
  screenTitle: string;
}) => {
  return (
    <Layout screenTitle={props.screenTitle}>
      <h2>Content Types</h2>
      <ul>
        {props.contentTypeApis.map((item: any) => {
          return (
            <li>
              {item.description} <br></br>
              <a class="" target="_blank" href={item.url}>
                {item.url}
              </a>
            </li>
          );
        })}
      </ul>
      <h2>Content List</h2>
      <ul>
        {props.contentListApis.map((item: any) => {
          return (
            <li>
              {item.description} <br></br>
              <a class="" target="_blank" href={item.url}>
                {item.url}
              </a>
            </li>
          );
        })}
      </ul>

      <h2>Content Item</h2>
      <ul>
        {props.contentApis.map((item: any) => {
          return (
            <li>
              {item.description} <br></br>
              <a class="" target="_blank" href={item.url}>
                {item.url}
              </a>
            </li>
          );
        })}
      </ul>
    </Layout>
  );
};
