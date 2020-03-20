var dataService = require("../../../services/data.service");
var eventBusService = require("../../../services/event-bus.service");
var globalService = require("../../../services/global.service");

module.exports = compareMainService = {
  startup: async function() {
    eventBusService.on("beginProcessModuleShortCode", async function(options) {
      if (options.shortcode.name === "COMPARE") {
        options.moduleName = "compare";
        await moduleService.processModuleInColumn(options);
      }
    });

    eventBusService.on("postModuleGetData", async function(options) {
      if (options.shortcode.name !== "COMPARE") {
        return;
      }

      let compareItems = await dataService.getContentByType("compare-item");
      options.viewModel.data.compareItems = compareItems;

      let contentType = await dataService.getContentType("compare-item");
      let tabs = contentType.components[0].components;

      let matrix = compareMainService.getMatrixData(tabs, compareItems);

      options.viewModel.data.contentType = tabs;
    });
  },

  getMatrixData: function(contentType, compareItems) {
    contentType.forEach(group => {
      console.log(group.label);
      group.components.forEach(element => {
        console.log("->" + element.label);

        //find matching compare item row
        compareItems.forEach(complareItem => {
          console.log(complareItem.data.productName);
        });
      });
    });
  }
};
