var dataService = require('../../../services/data.service');
var emitterService = require('../../../services/emitter.service');
var globalService = require('../../../services/global.service');

module.exports = tabMainService = {

    startup: async function () {
        emitterService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'TAB') {

                options.moduleName = 'tab';
                await moduleService.processModuleInColumn(options);
            }

        });


    emitterService.on("postModuleGetData", async function (options) {
        if (options.shortcode.name === "TAB") {
          await tabMainService.processData(options);
        }
      });
    },

    processData: async function (data) {
        data.viewModel.data.tabs.map(function (item, index) {
          item.index = `tab-${data.viewModel.id}-${index}`;
          item.active = index === 0 ? 'active' : '';
          item.show = index === 0 ? 'show' : '';

        })
        console.log('-->', data.viewModel.data.tabs);
      },

}

