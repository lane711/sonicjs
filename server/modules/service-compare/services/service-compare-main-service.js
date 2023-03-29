var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var formattingService = require("../../../services/formatting.service");
var helperService = require("../../../services/helper.service");

module.exports = serviceCompareMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "SERVICE-COMPARE") {
        options.moduleName = "service-compare";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name !== "SERVICE-COMPARE") {
        return;
      }


      options.viewModel.data.items.map(function (item, index) {
        item.descriptionTeaser = formattingService.stripHtmlTags(
          helperService.truncateString(item.description, 250)
        );
      });
    });
  },
};
