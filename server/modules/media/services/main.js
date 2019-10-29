var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');



module.exports = mainService = {

    startup: async function () {
        eventBusService.on('beginProcessModuleShortCode', async function (options) {
            
        });
    },

    processView: async function (contentTypeId, content) {

    }

}