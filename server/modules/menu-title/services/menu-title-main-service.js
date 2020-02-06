var dataService = require("../../../services/data.service");
var eventBusService = require("../../../services/event-bus.service");
var globalService = require("../../../services/global.service");

var sourceColumnId = undefined;
var titleModules = [];

module.exports = menuTitleMainService = {
  startup: async function() {
    // console.log('--> startup on menuTitleMainService');

    eventBusService.on("postProcessPage", async function(options) {
        // console.log('resetting titeModules');
        titleModules = [];

    });

    eventBusService.on("beginProcessModuleShortCodeDelayed", async function(options) {
      if (options.shortcode.name === "MENU-TITLE") {
        //TODO: don't process shortcode so that it can be processed after target columns has been built
        options.moduleName = "menu-title";

        // console.log('beginProcessModuleShortCodeDelayed',titleModules.length);
        // options.viewModel = {data : {headerTags: titleModules}};
        // console.log('tags', options.viewModel.data.headerTags);

        await moduleService.processModuleInColumn(options);


      }
    });

    eventBusService.on('postModuleGetData', async function (options) {

      if (options.shortcode.name === 'TITLE') {

        //TODO: how to delay processing of the module until after the module list is populated?
          titleModules.push(options.viewModel.data);
      }

      if (options.shortcode.name === 'MENU-TITLE') {

        //now we should have a complete list of title modules
          // console.log('postModuleGetData',titleModules.length);

          options.viewModel.data.headerTags = titleModules;
          options.viewModel.data.pageUrl = options.req.path;

          // var headerTagsArr = Array.from(titleModules);
          // const names = titleModules.map(item => item.text)

          // for (var titleModule of titleModules){
          //   options.viewModel.data.headerTags.push(titleModule);
          // }

          // console.log(options.viewModel.data.headerTags);
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
