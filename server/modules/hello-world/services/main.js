 var dataService = require('../../../services/data.service');
var eventBusService = require('../../../services/event-bus.service');



module.exports = mainService = {

    startup: async function () {
        eventBusService.on('beginProcessModule', async function (options) {
            console.log('hello from hello')

            options.pageContent = 'lane was here';
            if (options && options.page) {
                options.page.data.editForm = await formService.getForm(options.page.contentTypeId, options.page);
            }
        });
    },

    processView: async function (contentTypeId, content) {

    }

}