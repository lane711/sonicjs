const NodeCache = require("node-cache");
var cache;

module.exports = cacheService = {
  startup: function () {
    this.cache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 600 });
  },

  getCache: function () {
    if (process.env.MODE == "production") {
      return this.cache;
    }

    function get(){
      return undefined;
    }
    function set(){
      return undefined;
    }
    return { get, set };
  }

};
