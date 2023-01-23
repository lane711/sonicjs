/**
 * Cache Service -
 * The cache service uses NodeCache. It allows data and content, such as rendered pages to be cached, thus dramatically improving performance.
 * @module cacheService
 */
const NodeCache = require("node-cache");
var cache;

module.exports = cacheService = {
  startup: function () {
    if (process.env.MODE == "production") {
      this.cache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 600 });
    }
  },

  getCache: function () {
    if (process.env.MODE === "production") {
      return this.cache;
    }

    function get() {}
    function set() {}
    return { get, set };
  },
};
