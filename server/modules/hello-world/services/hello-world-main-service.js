var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');
var globalService = require('../../../services/global.service');
var moduleService = require('../../../services/module.service');

module.exports = helloWorldMainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {
            options.moduleName = 'hello-world';
            await moduleService.processModuleInColumn(options);
        });
    },

}