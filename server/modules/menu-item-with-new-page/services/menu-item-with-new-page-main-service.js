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

    emitterService.on("contentSaved", async function (options) {
      if (options.contentType === 'page' && options.createMenuItem) {
        let randomId = Math.random().toString(36).slice(2);
        var parent = "#";
        var node = {
          id: randomId,
          text: "New Link",
          data: { id: randomId, title: options.title, url: options.url, showInMenu: true },
          children: []
        };

        let menu = await dataService.getContentTopOne('menu');

        var updatedMenu = { data: { title: menu.data.title, contentType: "menu", links: menu.data.links } };


        updatedMenu.data.links.push(node);
        //      "13": "{\"id\":13,\"data\":{\"title\":\"Main\",\"contentType\":\"menu\",\"links\":[{\"id\":\"6e0ylrz3jei\",\"text\":\"Home\",\"icon\":\"fa fa-chevron-right\",\"li_attr\":{\"id\":\"6e0ylrz3jei\"},\"a_attr\":{\"href\":\"#\",\"id\":\"6e0ylrz3jei_anchor\"},\"state\":{\"loaded\":true,\"opened\":true,\"selected\":false,\"disabled\":false},\"data\":{\"id\":\"6e0ylrz3jei\",\"title\":\"Home\",\"url\":\"/\",\"showInMenu\":true,\"showChildren\":false},\"children\":[],\"type\":\"default\"},{\"id\":\"okfjjqsageb\",\"text\":\"Modules\",\"icon\":\"fa fa-chevron-right\",\"li_attr\":{\"id\":\"okfjjqsageb\"},\"a_attr\":{\"href\":\"#\",\"id\":\"okfjjqsageb_anchor\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":true,\"disabled\":false},\"data\":{\"id\":\"okfjjqsageb\",\"title\":\"Modules\",\"url\":\"/modules\",\"showInMenu\":false,\"showChildren\":false},\"children\":[],\"type\":\"default\"}],\"createdOn\":1598410945868}}",

        dataService.editInstance(menu);


        //add menu item to main menu
      }
    });
  };
})(
  typeof exports === "undefined"
    ? (this["menuItemWithNewPageMainService"] = {})
    : exports
);
