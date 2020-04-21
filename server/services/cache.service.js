const NodeCache = require("node-cache");
var cache;

module.exports = cacheService = {
  startup: function () {
    this.cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
  },

  getCache: function () {
    return this.cache;
  },

  test: function () {
    return 'ok';
  },
};
