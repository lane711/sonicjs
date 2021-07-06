var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var contentService = require("../../../services/content.service");
var formattingService = require("../../../services/formatting.service");

module.exports = pageTemplatesMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "PAGE-TEMPLATES") {
        options.moduleName = "page-templates";

        //reset html for current page template region
        let ptDiv = formattingService.generateModuleDivWrapper(
          options.shortcode.properties.id,
          "module",
          "",
          options.shortcode.name,
          options.shortcode.name,
          "PAGE TEMPLATE REGION"
        );

        let moduleClass = options.page.data.isPageTemplate ? 'module ' : '';
        options.page.data.currentShortCodeHtml = `<div class="${moduleClass} page-template-region mb-2" data-id="${options.shortcode.properties.id}" data-module="PAGE-TEMPLATES">PAGE TEMPLATE REGION START</div>`;

        await moduleService.processModuleInColumn(options);


      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "PAGE-TEMPLATES") {


        if (options.page.data.pageTemplateRegions) {
          let regionId = options.viewModel.data.id;
          let body = options.page.data.pageTemplateRegions.filter(
            (r) => r.regionId === regionId
          );
          // options.page.data.html = body[0].shortCodes;
          if (body && body.length > 0) {
            await contentService.processShortCodes(
              options.page,
              "s0",
              body[0].shortCodes,
              0,
              0,
              options.req
            );

            // var processedHtml ={
            //   id: "123",
            //   shortCode: { name: "ALERT" },
            //   contentType: "ALERT",
            //   body: options.page.data.currentShortCodeHtml,
            // };

            // await emitterService.emit(
            //   "postProcessModuleShortCodeProcessedHtml",
            //   {
            //     processedHtml: processedHtml,
            //     viewModel: options.viewModel,
            //   }
            // );
          }
        }
        options.page.data.currentShortCodeHtml += `<div class="page-template-region mt-2" data-id="${options.shortcode.properties.id}" data-module="PAGE-TEMPLATES">PAGE TEMPLATE REGION END</div>`;

        options.viewModel.data.html = options.page.data.currentShortCodeHtml;
        // options.viewModel.data.html = processedHtml.body;

        // if (options.page.data.isPageTemplate) {
        //   //we are viewing the template page itself
        //   options.viewModel.data.html = "<div>PAGE TEMPLATE REGION</div>";
        // }
      }
    });

    emitterService.on("preRenderTemplate", async function (options) {

    });

    emitterService.on("preProcessSections", async function (options) {
      // check is page is using a template
      if (options.page.data.pageTemplate && options.page.data.pageTemplate !== "none") {
        let templatePage = await dataService.getContentById(
          options.page.data.pageTemplate,
          options.req.sessionID
        );
        if(templatePage){
          options.page.data.layout = templatePage.data.layout;
        }
      }

    });
  },
};
