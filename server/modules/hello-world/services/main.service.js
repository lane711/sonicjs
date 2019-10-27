var dataService = require('./data.service');
var eventBusService = require('./event-bus.service');



module.exports = mainService = {

    startup: async function () {
        eventBusService.on('beginProcessModule', async function (options) {
            if (options && options.page) {
                options.page.data.editForm = await formService.getForm(options.page.contentTypeId, options.page);
            }
        });
    },

    processView: async function (contentTypeId, content) {

    }

}