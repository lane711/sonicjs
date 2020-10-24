if (typeof module !== "undefined" && module.exports) {
  var dataService = require("../../../services/data.service");
  var emitterService = require("../../../services/emitter.service");
  var globalService = require("../../../services/global.service");
} else {
  // var globalService = {};
}

// module.exports = menuItemWithNewPageMainService = {

//     startup: async function () {
//         emitterService.on('beginProcessModuleShortCode', async function (options) {

//             if (options.shortcode.name === 'MENU-ITEM-WITH-NEW-PAGE') {

//                 options.moduleName = 'menu-item-with-new-page';
//                 await moduleService.processModuleInColumn(options);
//             }
//         });

//         // require('../assets/js/menu-item-with-new-page-module');
//         menuItemWithNewPageMainService.setupEmiiter();

//     },

//     setupEmiiter: function(){
//       emitterService.on("getFormPostContentType", async function (options) {
//         console.log("newItemWithNewPage", options);

//         let checkBox = {
//           label: "Create Menu Item",
//           type: "checkbox" ,
//           key:'createMenuItem',
//           defaultValue: true
//         };
//         options.data.components.push(checkBox);
//       });
//     }

//     menuItemWithNewPageMainService.setupEmiiter();

// }

(function (exports) {

  // console.log(this);

  (exports.startup = async function () {


    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "MENU-ITEM-WITH-NEW-PAGE") {
        options.moduleName = "menu-item-with-new-page";
        await moduleService.processModuleInColumn(options);
      }
    });

    // setupEmiiter();

    // require('../assets/js/menu-item-with-new-page-module');
    // menuItemWithNewPageMainService.setupEmiiter();
  }),

    (exports.setupEmiiter = function () {
      emitterService.on("getFormPostContentType", async function (options) {
        console.log("newItemWithNewPage", options);

        let checkBox = {
          label: "Create Menu Item",
          type: "checkbox",
          key: "createMenuItem",
          defaultValue: true,
        };
        options.data.components.push(checkBox);
      });
    });

    // menuItemWithNewPageMainService.setupEmiiter();
})(
  typeof exports === "undefined"
    ? (this["menuItemWithNewPageMainService"] = {})
    : exports
);

menuItemWithNewPageMainService.setupEmiiter();
// (function (exports) {
//   // emitterService.on("getFormPostContentType", async function (options) {
//   //   console.log("newItemWithNewPage", options);

//   //   let checkBox = {
//   //     label: "Create Menu Item",
//   //     type: "checkbox" ,
//   //     key:'createMenuItem',
//   //     defaultValue: true
//   //   };
//   //   options.data.components.push(checkBox);
//   // });
//   exports.DoSomething = function () {};
// })(
//   typeof exports === "undefined" ? (this["newItemWithNewPage"] = {}) : exports
// );
