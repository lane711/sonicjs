var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = wikiMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'WIKI') {

                options.moduleName = 'wiki';
                await moduleService.processModuleInColumn(options);
            }

        });

        eventBusService.on('alterModuleViewModule', async function (options) {

          if (options.shortcode.name !== 'WIKI') {
              return;
          }

          options.viewModel.data.menu = "Lane"

          // console.log('contact module after view model', options.viewModel);

      });

    },

}
