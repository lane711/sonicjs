var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var contentService = require("../../../services/content.service");

module.exports = pageTemplatesMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "PAGE-TEMPLATES") {
        options.moduleName = "page-templates";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "PAGE-TEMPLATES") {

        let basePage = await dataService.getContentByUrl(options.req.originalUrl);

        if (!basePage.data.isPageTemplate) {
          // let data = await dataService.getContentByUrl(options.req.originalUrl);
          if(basePage.data.pageTemplateRegions){
            let body = basePage.data.pageTemplateRegions[0];
            basePage.data.html = body.shortCodes;
            await contentService.processShortCodes(basePage, 's0', body.shortCodes, 0, 0);

            // page,
            // section,
            // body,
            // rowIndex,
            // columnIndex
            options.viewModel.data.html = basePage.data.html;
            //  = 'tempplate proessed page';

          }
          // let page = await contentService.getPage(basePage.id, basePage);
        }

        if (options.page.data.isPageTemplate) {
          //we are viewing the template page itself
          // options.viewModel.data.html = '<div>PAGE TEMPLATE REGION</div>';

          // let data = await dataService.getContentByUrl(options.req.originalUrl);
          // if(options.page.date.pageTempateRegions){
            
          // }
          // let page = await contentService.getPage(data.id, data);
          // options.viewModel.data.html = page;
        }
        
      }
    });

    emitterService.on("preRenderTemplate", async function (options) {
      //TODO get from cache
      let data = await dataService.getContentByUrl(options.req.originalUrl);
      options.page.data.id = data.id;
    });

    emitterService.on("preProcessPageUrlLookup", async function (req) {
      if (req.url.indexOf("/docs/") === 0) {
        req.url = "/doc-details";
      }
    });
  },
};
