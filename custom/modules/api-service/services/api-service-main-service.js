var dataService = require("../../../../server/services/data.service");
var emitterService = require("../../../../server/services/emitter.service");
var globalService = require("../../../../server/services/global.service");
const NodeCache = require("node-cache");
const docCache = new NodeCache();

module.exports = apiServiceMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "API-SERVICE") {
        options.moduleName = "api-service";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "API-SERVICE") {
        await apiServiceMainService.getJSDocData(options);
      }
    });
  },

  getJSDocData: async function (data) {
    var apiData = [];

    let result = docCache.get("apiData");

    if (result) {
      apiData = result;
    } else {
      jsDocData = require("../../../../docs/json/jsdoc-ast.json");
      const modules = jsDocData.filter((m) => m.kind === "module");

      for (module of modules) {
        apiData.push({
          fileName: module.meta.filename,
          name: module.name,
          description: module.description,
        });
      }
      success = docCache.set("apiData", apiData, 12 * 60 *60); //12 hours
    }

    data.viewModel.data.apis = apiData;
  },
};
