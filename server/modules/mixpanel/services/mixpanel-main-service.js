var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = mixpanelMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'MIXPANEL') {

                options.moduleName = 'mixpanel';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}