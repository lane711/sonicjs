var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = alertMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'ALERT') {

                options.moduleName = 'alert';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}
