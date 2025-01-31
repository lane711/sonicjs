import { getD1DataByTable, insertD1Data } from "./d1-data";
import { getRecords, insertRecord } from "./data";
import { kvGetAll } from "./kv";
import TimeAgo from "javascript-time-ago";

// English.
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

// Create formatter (English).
const timeAgo = new TimeAgo("en-US");

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
      item.createdOnAgo = timeAgo.format(new Date(item.createdOn));
      item.updatedOnAgo = timeAgo.format(new Date(item.updatedOn));

      const matchingKvRecord = kvRecords.find(
        (record) => record.name === item.url
      );
      if (matchingKvRecord) {
        item.matchingKvRecord = true;
        item.kvUpdatedOnAgo = timeAgo.format(matchingKvRecord.metadata.updatedOn);
      } else {
        item.matchingKvRecord = false;
      }

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

export const purgeKvData = async (context) => {};
