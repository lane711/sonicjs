var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

module.exports = blogDetailsMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "BLOG-DETAILS-SETTINGS") {
        options.moduleName = "blog-details";
        options.shortcode.name = "BLOG-DETAILS";

        //get blog record
        const blog  = await dataService.getContentByUrl(options.req.originalUrl);
        // const blog = await dataService.getContentTopOne("blog");

        let viewModel = blog;

        await moduleService.processModuleInColumn(options, viewModel);
      }
    });

    emitterService.on("preProcessPageUrlLookup", async function (req) {
      if (req.url.indexOf("/blog/") === 0) {
        req.url = "/blog-details";
      }
    });
  },
};
