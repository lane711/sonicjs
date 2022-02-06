var dalService = require("./dal.service");
var dataService = require("./data.service");

var helperService = require("./helper.service");
var fileService = require("./file.service");
var logSymbols = require('log-symbols');

module.exports = installService = {
  checkInstallation: async function () {

    if(process.env.BYPASS_INSTALL_CHECK === 'TRUE'){
      return;
    }
    
    console.log(logSymbols.info, 'Checking Install...');


    await installService.checkDefaultContent();

    console.log(logSymbols.success, 'Install Verified!');

  },

  checkDefaultContent: async function (app) {
    console.log(logSymbols.info, 'Checking Base Content...');

    let session = {user : {id:"69413190-833b-4318-ae46-219d690260a9"}};

    let siteSettingsColors = await dataService.getContentByType(
      "site-settings-colors"
    );
    if (!siteSettingsColors || siteSettingsColors.length === 0) {
      let data = {
          contentType: "site-settings-colors",
          url: "/site-settings-colors",
          bodyBackground: "#F8F8F8",
          headerBackground: "#000",
          headerOpacity: ".95",
          background: "green",
          header: "#555555",
          submit: true,
      };
      let record = await dalService.contentUpdate(
        "",
        "/site-settings-colors",
        data,
        session
      );

      console.log("created siteSettingsColors:", record);
    }

    let siteSettings = await dataService.getContentByType("site-settings");
    if (siteSettings.length === 0) {
      let data = {
          contentType: "site-settings",
          url: "/site-settings",
          logoType: "text",
          logoTitle: "My Site",
          fontDefault: "Lato",
          fontHeaders: "Roboto",
          homePageId: "1",
      };
      let record = await dalService.contentUpdate(
        "",
        "/site-settings",
        data,
        session
      );
      console.log("created siteSettings:", record);
    }

    let themeSettings = await dataService.getContentByType("theme-settings");
    if (themeSettings.length === 0) {
      let data = {
          contentType: "theme-settings",
          url: "/theme-settings",
          logoType: "image",
          logoTitle: "Acme Widgets",
          fontSize: "24px",
          fontColor: "#fff",
          fileName: "temp-logo.png",
          imageWidth: "120px",
          imageStyle: "",
      };
      let record = await dalService.contentUpdate(
        "",
        "/theme-settings",
        data,
        session
      );
      console.log("created themeSettings:", record);
    }

    let googleAnalytics = await dataService.getContentByType("google-analytics");
    if (googleAnalytics.length === 0) {
      let data = {
          contentType: "google-analytics",
          url: "/google-analytics",
          "googleAnalyticsUACode" : "UA-132867068-1", 
          "enableOnDomain" : "sonicjs.com", 
      };
      let record = await dalService.contentUpdate(
        "",
        "/google-analytics",
        data,
        session
      );
      console.log("created googleAnalytics:", record);
    }

    // let mainMenu = await dataService.getContentByType("menu");
    let mainMenu = await menuService.getMenu("Main")
    if (!mainMenu) {
      let data = {
          contentType: "main-menu",
          url: "/main-menu",
          title: "Main", 
          contentType : "menu", 
          links : [
              {
                  "id" : "NQ6YeBCClIQ", 
                  "text" : "Home", 
                  "icon" : "bi bi-chevron-right",
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
      };
      let record = await dalService.contentUpdate(
        "",
        "/main-menu",
        data,
        session
      );
      console.log("created main menu:", record);
    }

    let page = await dataService.getContentByType("page");
    if (page.length === 0) {
      let data = {
          contentType: "page",
          url: "/",
          title : "Home", 
          showHero : false, 
          heroTitle : "", 
          pageCssClass : "", 
          autoGenerateUrl : false, 
      };
      let record = await dalService.contentUpdate(
        "",
        "/",
        data,
        session
      );
      console.log("created default page:", record);
    }

    console.log(logSymbols.success, 'Base Content Verified!');

  },
};
