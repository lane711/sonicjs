var dataService = require("../../../services/data.service");
var eventBusService = require("../../../services/event-bus.service");
var globalService = require("../../../services/global.service");
var Handlebars = require("handlebars");
var viewService = require("../../../services/view.service");
const path = require("path");
var menu;

module.exports = menu2ndLevelMainService = {
  startup: async function() {

    eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
      if (options) {
          menu = options.page.data.menu;
      }
  });


    menu2ndLevelMainService.registerHelper();

  },

  registerHelper: async function(){

    let amplitudeSettings = await dataService.getContentTopOne("menu2ndLevel");

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

    Handlebars.registerHelper("postMenuHelper", function() {
      console.log("result", result);

      return result;
    });
  }

};
