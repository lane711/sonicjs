import { getById, getDataListByPrefix } from "../../data/data";
import { Detail, Top } from "../theme";

export async function loadModules(context) {
  const data = await getDataListByPrefix(context.env.KVDATA, "site1::module");

  const list = data.keys.map((item) => {
    return {
      title: item.name,
      path: `/admin/modules/${item.name}`,
    };
  });

  return <Top items={list} screenTitle="Modules" newItemButtonText="New Module" />;
}

export async function loadModule(context) {
  console.log("context url", context.req);
  const id = context.req.path.split("/").pop();
  console.log("context id", id);

  const data = await getById(context.env.KVDATA, id);

  console.log("data module", data);

  return <Detail item={data.title} screenTitle="Module" />;
}