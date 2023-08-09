import { desc } from "drizzle-orm";
import { apiConfig } from "../../../db/schema";
import { getById, getDataListByPrefix, putData } from "../../data/kv-data";
import { Layout } from "../theme";
import { getD1DataByTable, getD1ByTableAndId } from "../../data/d1-data";

interface link {
  url: string;
  description: string;
}

export async function loadApis(ctx) {
  const tables = apiConfig;

  let tableApis: link[] = [];
  apiConfig.map((scehma) => {
    let link: link = {
      url: `/v1/${scehma.route}`,
      description: `get all records from the ${scehma.table} table`,
    };
    tableApis.push(link);

    let linkWithParams: link = {
      url: `/v1/${scehma.route}?limit=2&offset=2&sortBy=created_on&sortDirection=desc`,
      description: `get data from ${scehma.table} with limits, offsets and sorting`,
    };
    tableApis.push(linkWithParams);
  });

  let recordApis: link[] = [];

  await Promise.all(
    tables.map(async (scehma) => {
      const data = await getD1DataByTable(ctx.env.D1DATA, scehma.table, 1);
      if (data.length) {
        let link: link = {
          url: `/v1/${scehma.route}/${data[0].id}`,
          description: `get single record from the ${scehma.table} table`,
        };
        recordApis.push(link);
      }
    })
  );

  return (
    <Top tableApis={tableApis} recordApis={recordApis} screenTitle="APIs" />
  );
}

export const Top = (props: {
  tableApis: link[];
  recordApis: link[];
  screenTitle: string;
}) => {
  return (
    <Layout screenTitle={props.screenTitle}>
      <h2>Table APIs</h2>

      <table class="table">
        <thead>
          <tr>
            <th>Url</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {props.tableApis.map((item: any) => {
            return (
              <tr>
                <td>
                  <a class="" target="_blank" href={item.url}>
                    {item.url}
                  </a>
                </td>
                <td>{item.description}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>Record APIs</h2>

      <table class="table">
        <thead>
          <tr>
            <th>Url</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {props.recordApis.map((item: any) => {
            return (
              <tr>
                <td>
                  <a class="" target="_blank" href={item.url}>
                    {item.url}
                  </a>
                </td>
                <td>{item.description}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Layout>
  );
};
