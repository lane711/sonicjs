const NodeCache = require("node-cache");
const { values } = require("underscore");
const urlCache = new NodeCache();

module.exports = urlService = {
  startup: async (app) => urlCache.flushAll()  ,

  addUrl: async (url, handler, type, title, id, previousUrl, nextUrl ) => {
    // console.log("adding url:", url, id);
    return urlCache.set(url, { url, handler, type, title, id, previousUrl, nextUrl });
  },

  getUrls: async () => {
    const keys = urlCache.keys();
    const values = urlCache.mget(keys);
    return values;
  },

  getUrl: async (url) => {
    const urlKey = urlCache.get(url);
    return urlKey;
  },
};
