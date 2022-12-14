var dataService = require("../../../../server/services/data.service");
var emitterService = require("../../../../server/services/emitter.service");
var globalService = require("../../../../server/services/global.service");
const jsDocData = require("../../../../docs/json/jsdoc-ast.json");

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
    const modules = jsDocData.filter((m) => m.kind === "module");
    // console.log("modules from jsdoc json", modules);
    var apis = [];
    for (module of modules) {
      apis.push({
        fileName: module.meta.filename,
        name: module.name,
        description: module.description,
      });
    }

    data.viewModel.data.apis = apis;
  },
};
