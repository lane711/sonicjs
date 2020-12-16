if (typeof module !== "undefined" && module.exports) {
  var dataService = require("../../../services/data.service");
  var emitterService = require("../../../services/emitter.service");
  var globalService = require("../../../services/global.service");
  var menuService = require("../../../services/menu.service");

} else {
  // var globalService = {};
}

(function (exports) {
  exports.startup = async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "MENU-ITEM-WITH-NEW-PAGE") {
        options.moduleName = "menu-item-with-new-page";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("contentTypeLoaded", async function (options) {
      if(options.systemId !== 'page') return;
      let checkBox = {
        label: "Create Menu Item",
        type: "checkbox",
        key: "createMenuItem",
        defaultValue: true,
      };
      options.data.components.splice(1, 0, checkBox);
    });

    emitterService.on("contentSaved", async function (options) {
      if (options.contentType === 'page' && options.createMenuItem) {
        await menuService.addMenuItem(options.url, options.title);
      }
    });
  };
})(
  typeof exports === "undefined"
    ? (this["menuItemWithNewPageMainService"] = {})
    : exports
);
