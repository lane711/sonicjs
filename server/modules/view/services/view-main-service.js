var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = viewMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'VIEW') {

                options.moduleName = 'view';
                await moduleService.processModuleInColumn(options);
            }

        });

        emitterService.on("postModuleGetData", async function (options) {
            if (options.shortcode.name === "VIEW") {
              await viewMainService.getViewData(options);
              options.viewPath = 'server/modules/view/views/text-card.hbs';
            }
          });
    },

    getViewData: async function (options) {
        let id = options.shortcode.properties.id;
        options.viewModel.list = await dataService.getContentByType(
          options.viewModel.data.contentTypeToLoad,
          options.req.sessionID
        );
        // console.log(options.viewModel.data.contentTypeToLoad, moduleData);
    }

}

