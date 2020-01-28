var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = alterMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'ALTER') {

                options.moduleName = 'alter';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}