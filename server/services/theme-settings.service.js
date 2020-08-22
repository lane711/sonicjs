var dataService = require("./data.service");
var helperService = require("./helper.service");
var eventBusService = require("./event-bus.service");

var fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;

module.exports = themeSettingsService = {
  startup: async function () {
    eventBusService.on("getRenderedPagePostDataFetch", async function (
      options
    ) {
      if (options) {
        await themeSettingsService.processThemeSettings(options.page);
      }
    });
  },

  processThemeSettings: async function (page) {
    var themeSettings = await dataService.getContentTopOne("theme-settings");
    // console.log("themeSettings", themeSettings);
    page.data.themeSettings = themeSettings.data;
  },
};
