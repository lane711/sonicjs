var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

module.exports = voteMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "VOTE") {
        options.moduleName = "vote";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("formComponentsLoaded", async function (contentType) {
      const voteContentTypes = await dataService.getContentTopOne(
        "vote-site-settings"
      );

      if (
        voteContentTypes.data.applyToContentTypes.includes(contentType.systemId)
      ) {
        const voteContentType = await dataService.contentTypeGet("vote");
        const voteComponentsToAdd = voteContentType.data.components.filter(
          (c) => c.type !== "button"
        );

        contentType.data.components.splice(-1, 0, ...voteComponentsToAdd);
      }
    });
  },
};
