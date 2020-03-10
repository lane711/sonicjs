var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = listMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'LIST') {

                options.moduleName = 'list';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}