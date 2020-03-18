var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = compareMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'COMPARE') {

                options.moduleName = 'compare';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}