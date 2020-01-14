var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = titleMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'TITLE') {

                options.moduleName = 'title';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}