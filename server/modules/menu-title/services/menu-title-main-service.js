var dataService = require("../../../services/data.service");
var eventBusService = require("../../../services/event-bus.service");
var globalService = require("../../../services/global.service");

var sourceColumnId = undefined;
var titleModules = [];

module.exports = menuTitleMainService = {
  startup: async function() {
    eventBusService.on("beginProcessModuleShortCode", async function(options) {
      if (options.shortcode.name === "MENU-TITLE") {
        //TODO: don't process shortcode so that it can be processed after target columns has been built
        options.moduleName = "menu-title";
        await moduleService.processModuleInColumn(options);
      }
    });

    eventBusService.on('postModuleGetData', async function (options) {

      if (options.shortcode.name === 'TITLE') {

        //TODO: how to delay processing of the module until after the module list is populated?
          titleModules.push(options.viewModel.data);
      }

  });

    // eventBusService.on("postModuleGetData", async function(options) {
    //   if (options.shortcode.name !== "TITLE") {
    //     return;
    //   }

    //   sourceColumnId = options.viewModel.data.sourceColumnId;
    //   let sourceColumn = await menuTitleMainService.findColumnByHtmlId(
    //     options.section,
    //     sourceColumnId
    //   );
    //   console.log("sourceColumn", sourceColumn);
    //   let content =
    //     options.section.data.rows[options.rowIndex].columns[options.columnIndex]
    //       .content;
    //   options.viewModel.data.menu = "Lane";

    //   // console.log('contact module after view model', options.viewModel);
    //   globalService.pageContent;
    // });

    eventBusService.on("preRender", async function(options) {
      let x = sourceColumnId;
      globalService.pageContent;
    });
  },

  findColumnByHtmlId: async function(section, columnId) {
    for (const row of section.data.rows) {
      for (const column of row.columns) {
        if (column.id === columnId) {
          return column;
        }
      }
    }
  }

};
