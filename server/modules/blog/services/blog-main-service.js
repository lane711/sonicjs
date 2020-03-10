var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');

module.exports = blogMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {

            if (options.shortcode.name === 'BLOG') {

                options.moduleName = 'blog';
                await moduleService.processModuleInColumn(options);
            }

        });
    },

}