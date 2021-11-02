var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

module.exports = blogDetailsMainService = {

  startup: async function () {

    blogData = {};  

    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "BLOG-DETAILS") {
        options.moduleName = "blog-details";

        //get blog record
        const viewModel  = blogData;

        await moduleService.processModuleInColumn(options, viewModel);
      }
    });

    emitterService.on("preProcessPageUrlLookup", async function (req) {
      if (req.url.indexOf("/blog/") === 0) {

        //TODO: check is page exists
        // let post = await dataService.getContentByUrl(req.url);

        // if(post.id){
        //   req.url = "/blog-details";
        // }

      }
    });

    emitterService.on("postPageDataFetch", async function (options) {
      if(options.page){
        if (options.req.url === "/blog-details") {
          blogData  = await dataService.getContentByUrl(options.req.originalUrl, options.req.sessionID);

          options.page.data.heroTitle = blogData.data.title;
        }
      }
    });
    
  },
};
