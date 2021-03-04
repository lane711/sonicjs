var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = pageTemplatesMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'PAGE-TEMPLATES') {

                options.moduleName = 'page-templates';
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

