import { getById, getDataListByPrefix, putData } from "../../data/data";
import { Layout } from "../theme";

export async function loadApis(ctx) {
  // await ctx.env.KVDATA.put("host::sites::site2", JSON.stringify({ title: "The Blue Website" }));

  // console.log("mods ctx", ctx);
  // console.log("ctx KVDATA", ctx.env.KVDATA);

  const sites = await getDataListByPrefix(ctx.env.KVDATA, "host::sites");
  // console.log("sites -->", sites);

  //   const data = await getDataListByPrefix(ctx.env.KVDATA, "host::sites::");

  //   console.log("data site", data[0]);
  let contentTypeApis = [
    "/api/content-type/site1::content-type::blog",
  ];

  let contentApis = [
    "/api/content?includeContentType=true",
    "/api/content?contentType=blog",
    "/api/content?meta=true",
  ];

  // let data = [{id:"123",title:'ipsum'}];
  const list = contentTypeApis.map((item) => {
    console.log("data site", item);

    return {
      title: item,
      path: item,
    };
  });

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

export async function loadSite(ctx, id) {
  const data = await getById(ctx.env.KVDATA, "host::sites::orange-site");

  console.log("data site", data);
  const list = data.map((item) => {
    return {
      title: item.title,
      path: `/admin/content-types/${item.name}`,
    };
  });

  return <Top items={list} screenTitle="Sites" />;
}
