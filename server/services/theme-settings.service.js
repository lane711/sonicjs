var dataService = require("./data.service");
var helperService = require("./helper.service");
var emitterService = require("./emitter.service");

var fs = require("fs");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;

module.exports = themeSettingsService = {
  startup: async function () {
    emitterService.on("getRenderedPagePostDataFetch", async function (
      options
    ) {
      if (options) {
        await themeSettingsService.processThemeSettings(options);
      }
    });
  },

  processThemeSettings: async function (options) {
    var themeSettings = await dataService.getContentTopOne("theme-settings", options.req.sessionID);
    // console.log("themeSettings", themeSettings);
    options.page.data.themeSettings = themeSettings.data;
  },
};
