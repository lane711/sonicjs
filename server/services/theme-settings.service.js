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
    options.page.data.currentYear = new Date().getFullYear();

    //add bs version
    //server/themes/front-end/bootstrap5/bootstrap5.config.yml
    var themeConfig = await fileService.getYamlConfig(
      `/server/themes/front-end/${process.env.FRONT_END_THEME}/${process.env.FRONT_END_THEME}.config.yml`
    );

    options.page.data.themeSettings.bootstrapVersion = themeConfig['bootstrap-version'];
  },
};
