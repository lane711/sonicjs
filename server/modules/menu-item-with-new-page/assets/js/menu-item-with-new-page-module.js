// JS File for Module: menu-item-with-new-page

(function (exports) {
  emitterService.on("getFormPostContentType", async function (options) {
    console.log("newItemWithNewPage", options);

    let checkBox = {
      label: "Create Menu Item",
      type: "checkbox" ,
      key:'createMenuItem',
      defaultValue: true
    };
    options.data.components.push(checkBox);
  });
  exports.DoSomething = function () {};
})(
  typeof exports === "undefined" ? (this["newItemWithNewPage"] = {}) : exports
);
