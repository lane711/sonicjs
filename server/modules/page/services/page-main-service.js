var dalService = require("../../../services/dal.service");
var emitterService = require("../../../services/emitter.service");
var contentService = require("../../../services/content.service");
const urlService = require("../../../services/url.service");

var sourceColumnId = undefined;
var titleModules = [];

module.exports = pageMainService = {
  startup: async function () {
    emitterService.on("modulesLoaded", async function (options) {
      const pages = await dalService.contentGet(
        null,
        "page",
        null,
        null,
        null,
        null,
        null,
        null,
        true
      );
      pages.map((page) => {
        const pageData = JSON.parse(page.data);
        urlService.addUrl(page.url, "pageHandler", "exact", pageData.title);
      });
    });

    emitterService.on("processUrl", async function (options) {
      if (options.urlKey.handler === "pageHandler") {
        var { page : pageData } = await contentService.getRenderedPage(options.req);
        options.page = pageData;

        return;
      }
    });
  },
};
