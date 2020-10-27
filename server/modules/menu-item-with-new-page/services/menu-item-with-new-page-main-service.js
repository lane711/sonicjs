if (typeof module !== "undefined" && module.exports) {
  var dataService = require("../../../services/data.service");
  var emitterService = require("../../../services/emitter.service");
  var globalService = require("../../../services/global.service");
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

      let checkBox = {
        label: "Create Menu Item",
        type: "checkbox",
        key: "createMenuItem",
        defaultValue: true,
      };

      options.data.components.push(checkBox);
    });

})(
  typeof exports === "undefined"
    ? (this["menuItemWithNewPageMainService"] = {})
    : exports
);
