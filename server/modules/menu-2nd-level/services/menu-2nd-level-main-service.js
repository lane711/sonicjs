var dataService = require("../../../services/data.service");
var eventBusService = require("../../../services/event-bus.service");
var globalService = require("../../../services/global.service");
var Handlebars = require("handlebars");
var viewService = require("../../../services/view.service");
const path = require("path");

module.exports = menu2ndLevelMainService = {
  startup: async function() {
    //register hbs helper
    await Handlebars.registerHelper("postMenu", async function() {
      let viewModel = [
        { title: "title", link: "/whatever" },
        { title: "title2", link: "/whatever2" }
      ];
      let viewPath = path.join(
        __dirname,
        "..",
        "views/menu-2nd-level-main.handlebars"
      ); //  __dirname + `/../views/menu-2nd-level-main.handlebars`;
      console.log("viewPath", viewPath);
      var result = await viewService.getProccessedView("", viewModel, viewPath);

      console.log("result", result);

      return result;
    });

    eventBusService.on("beginProcessModuleShortCode", async function(options) {
      if (options.shortcode.name === "MENU-2ND-LEVEL") {
        options.moduleName = "menu-2nd-level";
        await moduleService.processModuleInColumn(options);
      }
    });
  }
};
