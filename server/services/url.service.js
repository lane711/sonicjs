const NodeCache = require("node-cache");
const urlCache = new NodeCache();

module.exports = urlService = {

  startup: async (app) => {

  },

  getUrls: async () => {
    let urls = [{url: '/123', handler:'pageHandler'}]
    return urls;
  }

}