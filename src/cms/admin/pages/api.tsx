import { getById, getDataListByPrefix, putData } from "../../data/data";
import { Layout } from "../theme";

export async function loadApis(ctx) {

  const sites = await getDataListByPrefix(ctx.env.KVDATA, "host::sites");

  let contentTypeApis = [
    "/api/content-type/site1::content-type::blog",
  ];

  let contentApis = [
    "/api/content?includeContentType=true",
    "/api/content?contentType=blog",
    "/api/content?meta=true",
  ];

  return <Top contentTypeApis={contentTypeApis} contentApis={contentApis} screenTitle="APIs" />;
}

export const Top = (props: {
  contentTypeApis: string[];
  contentApis: string[];
  screenTitle: string;
}) => {
  return (
    <Layout screenTitle={props.screenTitle}>
      <h2>Content Types</h2>
      <ul>
        {props.contentTypeApis.map((item: any) => {
          return (
            <li>
              <a class="" target="_blank" href={item}>
                {item}
              </a>
            </li>
          );
        })}
      </ul>
      <h2>Content</h2>
      <ul>
        {props.contentApis.map((item: any) => {
          return (
            <li>
              <a class="" target="_blank" href={item}>
                {item}
              </a>
            </li>
          );
        })}
      </ul>
    </Layout>
  );
};

