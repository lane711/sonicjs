import { desc } from 'drizzle-orm';
import { apiConfig } from '../../../db/routes';
import { getById, getDataListByPrefix, saveKVData } from '../../data/kv-data';
import { Layout } from '../theme';
import { getD1DataByTable, getD1ByTableAndId } from '../../data/d1-data';
import { Bindings } from '../../types/bindings';

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
      description: `get all records from the ${scehma.table} table`
    };
    tableApis.push(link);

    let linkWithParams: link = {
      url: `/v1/${scehma.route}?limit=2&offset=2&sortBy=createdOn&sortDirection=desc`,
      description: `get data from ${scehma.table} with limits, offsets and sorting`
    };
    tableApis.push(linkWithParams);
  });

  let recordApis: link[] = [];

  await Promise.all(
    tables.map(async (schema) => {
      const results = await getD1DataByTable(
        ctx.env.D1DATA,
        schema.table,
        {
          limit: 1
        }
      );
      if (results.length) {
        let link: link = {
          url: `/v1/${schema.route}/${results[0].id}`,
          description: `get single record from the ${schema.table} table`
        };
        recordApis.push(link);
      }
    })
  );

  return (
    <Top
      username={ctx.get('user')?.email}
      tableApis={tableApis}
      recordApis={recordApis}
      screenTitle='APIs'
      env={ctx.env}
    />
  );
}

export const Top = (props: {
  tableApis: link[];
  recordApis: link[];
  screenTitle: string;
  username?: string;
  env?: Bindings;
}) => {
  return (
    <Layout
      env={props.env}
      username={props.username}
      screenTitle={props.screenTitle}
    >
      <h2>Table APIs</h2>

      <table class='table'>
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
                  <a class='' target='_blank' href={item.url}>
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
      <ApiTable recordApis={props.recordApis}></ApiTable>
    </Layout>
  );
};

export const ApiTable = (props: { recordApis: link[] }) => {
  if (props.recordApis.length == 0) {
    return (
      <h4>
        The record API list will be displayed once you have some sample data in
        your database.
      </h4>
    );
  } else {
    return (
      <table class='table'>
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
                  <a class='' target='_blank' href={item.url}>
                    {item.url}
                  </a>
                </td>
                <td>{item.description}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
};
