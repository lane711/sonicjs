var dataService = require("../../../services/data.service");
var eventBusService = require("../../../services/event-bus.service");
var globalService = require("../../../services/global.service");

module.exports = imageMainService = {
  startup: async function () {
    eventBusService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "IMAGE") {
        options.moduleName = "image";
        await moduleService.processModuleInColumn(options);
      }
    });

    eventBusService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name !== "IMAGE") {
        return;
      }

      if (options.viewModel.data.thumbnailWidth === 0) {
        options.viewModel.data.thumbnailWidth = "100%";
        return;
      }

      let width = options.viewModel.data.thumbnailWidth;
      options.viewModel.data.thumbnailWidthRetina = width * 2;
    });
  },
};
