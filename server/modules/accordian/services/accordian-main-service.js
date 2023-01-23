var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

module.exports = accordianMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "ACCORDIAN") {
        options.moduleName = "accordian";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "ACCORDIAN") {
        await accordianMainService.processData(options);
      }
    });
  },

  processData: async function (data) {
    data.viewModel.data.items.map(function (item, index) {
      item.index = `${data.viewModel.id}-${index}`;
    });
  },
};
