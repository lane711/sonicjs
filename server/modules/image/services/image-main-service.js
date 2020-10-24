var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

module.exports = imageMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "IMAGE") {
        options.moduleName = "image";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
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
