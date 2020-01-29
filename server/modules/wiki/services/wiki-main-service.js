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


    },

}
