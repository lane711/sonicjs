import { getD1DataByTable, insertD1Data } from "./d1-data";
import { getRecords, insertRecord } from "./data";
import { kvGetAll } from "./kv";

export const getAdminKvData = async (context) => {
  try {
    const cacheRequests = await getD1DataByTable(
      context.locals.runtime.env.D1,
      "cacheRequests",
      {}
    );

    const kvRecords = await kvGetAll(context);

    const cacheRequestsCount = cacheRequests.length;
    const kvRecordsCount = kvRecords.length;

    const data = cacheRequests.map((item) => {
      item.url = item.url;
      item.matchingKvRecord = kvRecords.find((record) => record.name === item.url) != null || false;
      return item;
    });

    return {
      cacheRequests: cacheRequests,
      kvRecords: kvRecords,
      cacheRequestsCount: cacheRequestsCount,
      kvRecordsCount: kvRecordsCount,
      data: data,
    };

  } catch (error) {
    console.error(error);
  }
};

export const cacheRequestInsert = async (context, d1, kv, url) => {
  try {
    const data = { url: url };
    insertD1Data(d1, kv, "cacheRequests", data);
  } catch (error) {
    console.error(error);
  }
};

export const purgeKvData = async (context) => {

}
