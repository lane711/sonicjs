var dataService = require("./data.service");
var helperService = require("./helper.service");
var emitterService = require("./emitter.service");

var fs = require("fs");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");

module.exports = menuService = {
  startup: function () {
    emitterService.on("getRenderedPagePostDataFetch", async function (options) {
      if (options) {
        let menuData = await menuService.getMenu("Main", options.req.sessionID);
        if (menuData) {
          menuData.forEach((menuItem) => {
            menuItem.isActive = menuItem.data.url === options.req.path;

            menuItem.children.forEach((subMenuItem) => {
              //if child is active, set parent active too
              if (subMenuItem.data.url === options.req.path) {
                menuItem.isActive = true;
              }
            });

            //has children?
            if (menuItem.children.length > 0 && menuItem.data.showChildren) {
              menuItem.showChildren = true;
            } else {
              menuItem.showChildren = false;
            }

            // menuItem.isActive = options.req.path.startsWith(menuItem.data.url);
          });
          options.page.data.menu = menuData;
          options.page.data.menuSecondLevel = menuService.processSecondLevel(
            menuData,
            options.req.path
          );
        }
      }
    });
  },

  processSecondLevel: function (menuData, url) {
    let activeNode = menuData.find((x) => x.isActive === true);
    if (activeNode && activeNode.children && activeNode.children.length > 0) {
      activeNode.children.forEach((menuItem) => {
        menuItem.isActive = menuItem.data.url === url;
      });

      return activeNode.children;
    }
  },

  getMenu: async function (menuName, sessionID) {
    let menuData = await dataService.getContentByContentTypeAndTitle(
      "menu",
      menuName,
      sessionID
    );
    if (menuData) {
      let links = menuData.data.links;

      return links;
    }
    // let menu = [];

    // for (let index = 0; index < links.length; index++) {
    //     const item = links[index];

    //     if (item.level == 0) {
    //         let hasChildren = this.hasChildren(links, index);

    //         let childLinks = this.getChildren(links, hasChildren, index);

    //         menu.push({
    //             url: item.url,
    //             title: item.title,
    //             active: item.active,
    //             hasChildren: hasChildren,
    //             childLinks: childLinks
    //         });
    //     }
    // }

    // // menuData.data.links.forEach(item => {
    // //     menu.push({url: item.url});
    // // });

    // return menu;
  },

  hasChildren: function (links, currentLinkIndex) {
    if (currentLinkIndex < links.length - 1) {
      let currentLink = links[currentLinkIndex];
      let nextLink = links[currentLinkIndex + 1];
      if (currentLink.level == 0 && nextLink.level == 1) {
        return true;
      }
    }
    return false;
  },

  getChildren: function (links, hasChildren, currentLinkIndex) {
    let childLinks = [];
    if (hasChildren) {
      for (let index = currentLinkIndex + 1; index < links.length; index++) {
        let currentLink = links[index];
        if (currentLink.level == 1) {
          childLinks.push({
            url: currentLink.url,
            title: currentLink.title,
            hasChildren: false,
          });
        } else {
          break;
        }
      }
    }

    return childLinks;
  },

  addMenuItem: async function (url, linkText) {
    let randomId = Math.random().toString(36).slice(2);
    var parent = "#";
    var node = {
      id: randomId,
      text: linkText,
      data: { id: randomId, title: linkText, url: url, showInMenu: true },
      children: [],
    };

    let menu = await dataService.getContentTopOne("menu", undefined);

    var updatedMenu = {
      data: {
        title: menu.data.title,
        contentType: "menu",
        links: menu.data.links,
      },
    };

    let linkAlreadyExists =
      updatedMenu.data.links.filter((x) => x.data.url == url).length > 0;

    if (!linkAlreadyExists) {
      updatedMenu.data.links.push(node);
      dataService.editInstance(menu);
    }
  },
};
