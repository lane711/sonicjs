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
      let record = await dataService.contentCreate(data, false);
      console.log("created siteSettingsColors:", record);
    }

    let siteSettings = await dataService.getContentByType("site-settings");
    if (siteSettings.length === 0) {
      let data = {
        data: {
          contentType: "site-settings",
          url: "/site-settings",
          logoType: "text",
          logoTitle: "My Site",
          fontDefault: "Lato",
          fontHeaders: "Roboto",
          homePageId: "1",
        },
      };
      let record = await dataService.contentCreate(data, false);
      console.log("created siteSettings:", record);
    }

    let themeSettings = await dataService.getContentByType("theme-settings");
    if (themeSettings.length === 0) {
      let data = {
        data: {
          contentType: "theme-settings",
          url: "/theme-settings",
          logoType: "image",
          logoTitle: "Acme Widgets",
          fontSize: "24px",
          fontColor: "#fff",
          fileName: "temp-logo.png",
          imageWidth: "120px",
          imageStyle: "",
        },
      };
      let record = await dataService.contentCreate(data, false);
      console.log("created themeSettings:", record);
    }

    let googleAnalytics = await dataService.getContentByType("google-analytics");
    if (googleAnalytics.length === 0) {
      let data = {
        data: {
          contentType: "google-analytics",
          url: "/google-analytics",
          "googleAnalyticsUACode" : "UA-132867068-1", 
          "enableOnDomain" : "sonicjs.com", 
        },
      };
      let record = await dataService.contentCreate(data, false);
      console.log("created googleAnalytics:", record);
    }

    // let mainMenu = await dataService.getContentByType("menu");
    let mainMenu = await menuService.getMenu("Main")
    if (!mainMenu) {
      let data = {
        data: {
          contentType: "main-menu",
          url: "/main-menu",
          title: "Main", 
          contentType : "menu", 
          links : [
              {
                  "id" : "NQ6YeBCClIQ", 
                  "text" : "Home", 
                  "icon" : "fa fa-chevron-right", 
                  "li_attr" : {
                      "id" : "NQ6YeBCClIQ"
                  }, 
                  "a_attr" : {
                      "href" : "#", 
                      "id" : "NQ6YeBCClIQ_anchor"
                  }, 
                  "state" : {
                      "loaded" : true, 
                      "opened" : false, 
                      "selected" : true, 
                      "disabled" : false
                  }, 
                  "data" : {
                      "id" : "NQ6YeBCClIQ", 
                      "title" : "Home", 
                      "url" : "/", 
                      "showInMenu" : true, 
                      "showChildren" : false
                  }, 
                  "children" : [
  
                  ], 
                  "type" : "default"
              }
          ]
        },
      };
      let record = await dataService.contentCreate(data, false);
      console.log("created main menu:", record);
    }


  },
};
