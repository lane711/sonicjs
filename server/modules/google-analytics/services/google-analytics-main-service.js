var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = googleAnalyticsMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'GOOGLE-ANALYTICS') {

                options.moduleName = 'google-analytics';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}