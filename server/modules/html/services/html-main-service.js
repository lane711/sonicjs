var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = htmlMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

                if (options.shortcode.name === 'HTML') {

                    options.moduleName = 'html';
                    await moduleService.processModuleInColumn(options);
                }

        });
    },

}