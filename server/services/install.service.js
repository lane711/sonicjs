var dataService = require("./data.service");
var helperService = require("./helper.service");
var fileService = require("./file.service");

module.exports = installService = {
  checkInstallation: async function () {
    console.log("checking install");

    installService.checkDefaultContent();
  },

  checkDefaultContent: async function () {
    console.log("checking default content");

    let siteSettingsColors = await dataService.getContentByType(
      "site-settings-colors"
    );
    if (siteSettingsColors.length === 0) {
      let data = {
        data: {
          contentType: "site-settings-colors",
          url: "/site-settings-colors",
          bodyBackground: "#F8F8F8",
          headerBackground: "#000",
          headerOpacity: ".95",
          background: "green",
          header: "#555555",
          createdOn: 1602119522916.0,
          submit: true,
        },
      };
      let record = await dataService.contentCreate(data);
    }
    console.log("siteSettingsColors", siteSettingsColors);
  },
};
