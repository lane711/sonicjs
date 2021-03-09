var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');
var contentService = require('../../../services/content.service');

module.exports = pageTemplatesMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'PAGE-TEMPLATES') {

                options.moduleName = 'page-templates';

                let data = await dataService.getContentByUrl(options.req.originalUrl);
                // let page = await contentService.getPage(data.id, data);
                await moduleService.processModuleInColumn(options);
            }

        });

        emitterService.on("preProcessPageUrlLookup", async function (req) {
            if (req.url.indexOf("/docs/") === 0) {
              req.url = "/doc-details";
            }
          });
    },

}

